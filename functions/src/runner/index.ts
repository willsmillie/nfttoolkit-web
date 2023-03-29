import admin from 'firebase-admin';
import functions from 'firebase-functions';
import { tasks, db } from '../utils/firebase.js';
import workers from './workers.js';

// Performs any tasks pending in the queue
const checkTaskQueue = async () => {
  console.log('========== PUBSUB FUNCTION ==========');
  const now = admin.firestore.Timestamp.now().toDate();

  // Query all pending scheduled tasks
  const tasksToPerform = await tasks.where('performAt', '<=', now).where('status', '==', 'scheduled').get();

  // Jobs to execute concurrently.
  const jobs: Promise<any>[] = [];

  // Batch write jobs
  var batch = db.batch();

  // prepare each task received, adding it to the jobs array
  tasksToPerform.forEach((snapshot) => {
    // limit jobs to less than 500, per firebase batch write operations limits
    if (jobs.length <= 500) {
      const { worker, options } = snapshot.data();

      // call the relevant worker and update the scheduled task with the results
      const job = workers[worker](options)
        .then(() => batch.set(snapshot.ref, { status: 'complete' }))
        .catch((err) => {
          console.error(err);
          batch.set(snapshot.ref, { status: 'error', message: err.message });
        });

      // att the array of promised jobs
      jobs.push(job);
    }
  });

  // execute all the promised jobs
  return await Promise.all(jobs).then(() =>
    batch.commit().then(() => {
      console.log('BATCH WROTE AFTER PERFORMING JOBS');
    })
  );
};

// manually run the task queue (used for local dev)
const run = functions.https.onRequest(async (req: any, res: any) => {
  checkTaskQueue();
  res.send({ message: 'ok' });
});

// Task queue runs every minute
const runner = functions.runWith({ memory: '2GB' }).pubsub.schedule('* * * * *').onRun(checkTaskQueue);

export default {
  run,
  runner,
};
