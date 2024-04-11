const express = require("express");

const router = express.Router();
const { db } = require("../../utils/firebase");
const { getAccountNFTs } = require("../../utils/loopring/graphQL");
const { deriveCollectionsFromNFTs } = require("../../utils/loopring");

// parse the collection identifier from the url for loopring & gamestop respectively
const parseCollectionId = (url) => {
  const gamestopRegex = /collectionId=([a-f0-9-]+)/;
  const loopringRegex = /\/([^/]+)$/;

  let match = url?.match(gamestopRegex);
  if (match) return match[1];

  match = url?.match(loopringRegex);
  if (match) return match[1];

  return null;
};

const getGates = async (accountId) => {
  if (!accountId) return [];
  const nfts = await getAccountNFTs(accountId);

  const nftIds = (nfts ?? []).map((e) => e.nftId);
  const collectionIds = await deriveCollectionsFromNFTs(nfts, accountId)
      .then((collections) => collections.map((e) => parseCollectionId(e?.collectionAddress) ?? e?.contractAddress));

  return [nftIds, collectionIds].flat().map((e)=>e?.toString());
};

// Serve the entire list of gateIds for which an account may access
router.get("/account/:id/gates", async (req, res) => {
  try {
    const accountId = req.params.id;
    const allIds = await getGates(accountId);
    res.json(allIds);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while listing gates" });
  }
});

// Serve the entire file list for a specific account
// :accountId - ID of the user account
// GET /api/files/account/:accountId
// Returns the entire file list for the specified account if the access token is valid and authorized
router.get("/account/:id", async (req, res) => {
  try {
    const accountId = req.params.id;
    // derive the gateIds from the users nftIds & collections addresses
    const gateIds = await getGates(accountId.toLowerCase());

    const filesRef = db.collection("files");
    const batchSize = 30; // Maximum number of values in each batch

    // Split the gateIds into multiple batches
    const gateIdBatches = [];
    for (let i = 0; i < gateIds.length; i += batchSize) {
      const batch = gateIds.slice(i, i + batchSize);
      gateIdBatches.push(batch);
    }

    // Perform multiple queries for each batch of gateIds
    const queries = gateIdBatches.map((batch) => filesRef.where("gateIds", "array-contains-any", batch).get());

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

    res.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "An error occurred while listing files" });
  }
});

/**
 * GET /api/files/gate/:gateId
 * Retrieves the file list for a specific gateId.
 * @param {string} gateId - The gateId for which to retrieve the file list.
 * @returns {Array} - The file list for the specified gateId.
 * @throws {Error} - If an error occurs while retrieving the file list.
 */
router.get("/gate/:gateId", async (req, res) => {
  try {
    const { gateId } = req.params;

    const filesRef = db.collection("files");
    const querySnapshot = await filesRef.where("gateIds", "array-contains", gateId).get();

    const files = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "An error occurred while listing files" });
  }
});


// Export the router
module.exports = router;
