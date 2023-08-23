import _ from 'lodash';
import { db } from 'src/utils/firebase';
import { parseCollectionId, fetchTokenMetadata, fetchTokenCollectionMetadata } from 'src/hooks/useTokenResolver';
import isValidResource from 'src/utils/isValidResource';
import { ipfsToHttp } from './ipfs';

const TIMEOUT_DELAY = 5000; // 5 seconds

export const getFilesForGates = async (gateIds) => {
  try {
    const filesRef = db.collection('files');
    const batchSize = 30; // Maximum number of values in each batch

    // Split the gateIds into multiple batches
    const gateIdBatches = [];
    for (let i = 0; i < gateIds.length; i += batchSize) {
      const batch = gateIds.slice(i, i + batchSize);
      gateIdBatches.push(batch);
    }

    // Perform multiple queries for each batch of gateIds
    const queries = gateIdBatches.map((batch) =>
      filesRef.where('gateIds', 'array-contains-any', batch).orderBy('dateModified', 'desc').get()
    );

    // Execute all queries concurrently using Promise.all()
    const querySnapshots = await Promise.all(queries);

    // Merge the snapshots into a single result
    const mergedSnapshot = querySnapshots.reduce((result, snapshot) => {
      snapshot.forEach((doc) => {
        result.push(doc);
      });
      return result;
    }, []);

    const files = [];
    mergedSnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });

    return files.sort((a, b) => b.dateModified.toDate() - a.dateModified.toDate());
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

// get all gateIds from nfts
export const parseGatesFromNFTs = async (nfts) => {
  const nftIds = nfts.map((e) => e.nftId);
  const collectionIds = nfts
    .map((e) => e.collectionInfo)
    .filter((e) => !_.isNil(e))
    .map((e) => e.collectionAddress ?? e.contractAddress)
    .map(parseCollectionId);

  const promises = nfts.map((e) => e.nftId).map(fetchTokenMetadata);
  const nftMetadatas = await Promise.all(
    promises.map(async (promise, index) => {
      try {
        const result = await Promise.race([
          promise,
          new Promise((resolve) => setTimeout(() => resolve(null), TIMEOUT_DELAY)),
        ]);

        if (result !== null) {
          return result;
        } else {
          return nfts[index]?.collectionInfo ?? nfts[index]?.metadata;
        }
      } catch (error) {
        return nfts[index]?.collectionInfo ?? nfts[index]?.metadata;
      }
    })
  );

  const collectionsFromMetadata = _.uniqWith(
    nftMetadatas
      .map((e) => e.collection_metadata ?? e.collectionAddress ?? e.contractAddress)
      .filter((e) => !_.isNil(e)),
    _.isEqual
  );
  const collectionUrls = collectionsFromMetadata.filter(isValidResource).map(ipfsToHttp);

  // dispatch resolution & caching of metadata
  await Promise.all(collectionUrls.map((url) => ({ collection_metadata: url })).map(fetchTokenCollectionMetadata));

  const gateIds = [...new Set([...nftIds, ...collectionIds, ...collectionsFromMetadata.map(parseCollectionId)])];
  return gateIds;
};
