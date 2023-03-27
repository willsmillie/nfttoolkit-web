import * as functions from "firebase-functions";
import {cids} from "./utils/firebase.js";
import {indexCID} from "./runner/tasks.js";
import cors from "cors";
const corsHandler = cors({origin: true});

// IPFS-GET ENDPOINT: Get the contents of a pinned file/dir on the IPFS network, provided a CID
const get = functions.https.onRequest(async (req, res) => {
  return await corsHandler(req, res, async () => {
    // ipfs cid to fetch, provided by the client
    const cid = req.query.cid ?? req.body.cid ?? "";

    // attempt to fetch a cached version
    const data = await cids
        .doc(cid)
        .get()
        .then((res) => res.data())
        .catch((err) => console.warn(err));

    if (data) return res.send(data);

    console.warn("FALLING BACK TO INDEXING");
    // If fails bc its missing, create a task to index it.
    await indexCID(cid);
    // return the response to the client
    return res.send({status: "indexing"});
  });
});

export default {
  get,
};
