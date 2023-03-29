import getCacheOrFetch from '../utils/getCacheOrFetch.js';
import { accounts, db } from '../utils/firebase.js';
import { indexAccount, indexAccountById } from '../runner/tasks.js';
import * as Web3 from '../utils/web3.js';

export const getBalances = Web3.getBalances;

// Get an account by address from the DB, or index it
export const getAccount = async (account) => {
  const dispatchIndex = async (account) => await indexAccount(account);
  return await getCacheOrFetch(accounts, account, dispatchIndex);
};

// get accounts by ens /
export const getAccountsByAddresses = async (mixedAddresses) => {
  // 0x addresses to return
  var results = [];

  // get it from the db
  await accounts
    .where(
      'ens',
      'in',
      mixedAddresses.filter((e) => e.endsWith('.eth'))
    )
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });
    })
    .catch((err) => console.error(err.message));

  // accounts to be indexed
  const missingAccounts = mixedAddresses
    .filter((addressOrEns) => !results.find((i) => i.ens === addressOrEns || i.address === addressOrEns))
    .filter((e) => e.endsWith('.eth'));

  // index the missing accounts
  if (missingAccounts.length > 0) {
    for (const i in missingAccounts) {
      const mixedAddress = missingAccounts[i];
      if (mixedAddress) indexAccount(mixedAddress);
    }
  } else {
    return { results };
  }

  return { status: 'indexing' };
};

// get accounts ids
export const getAccountsByIds = async (accountIds) => {
  // after all of the data is fetched, return it
  const results = await getContentById([...accountIds], 'accounts');

  // accounts to be indexed
  const missingAccounts = accountIds.filter((id) => !results.find((i) => i.accountId === id));

  // index the missing accounts
  if (missingAccounts.length > 0) {
    console.log(missingAccounts.length, ' Missing accounts');
    for (const i in missingAccounts) {
      const mixedAddress = missingAccounts[i];
      if (mixedAddress) indexAccountById(mixedAddress);
    }
  } else {
    return { results: results };
  }

  return { status: 'indexing' };
};

export async function getContentById(ids, path = 'accounts') {
  // don't run if there aren't any ids or a path for the collection
  if (!ids || !ids.length || !path) return [];

  const collectionPath = db.collection(path);
  const batches = [];

  while (ids.length) {
    // firestore limits batches to 10
    const batch = ids.splice(0, 10);

    // add the batch request to to a queue
    batches.push(
      collectionPath
        .where('accountId', 'in', [...batch])
        .get()
        .then((results) => results.docs.map((result) => ({ /* id: result.id, */ ...result.data() })))
    );
  }

  // after all of the data is fetched, return it
  return Promise.all(batches).then((content) => content.flat());
}
