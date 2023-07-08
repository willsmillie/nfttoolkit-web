const express = require("express");

const router = express.Router();
const { getAccountNFTs, getAccountMintedNFTs } = require("../../utils/loopring/graphQL");
const { getAccountCollections } = require("../../utils/loopring/api");
const { deriveCollectionsFromNFTs } = require("../../utils/loopring");

// Define the routes for the /api/account endpoint
// GET /api/account
// Returns a JSON response indicating the status of the nfttoolkit/api/accounts service
router.get("/", (req, res) => res.send({ status: "nfttoolkit/api/accounts at your service!" }));

// Get the NFTs Collections held by a specific Loopring account
// :id - Loopring account ID (Number)
// GET /api/account/:id/collections
// Returns an array of collections
router.get("/:id/collections", async (req, res) => {
  try {
    const accountId = req.params.id;
    // const accountAddress = req.query.owner;
    const results = await getAccountCollections(accountId);
    // const gmeResults = await getGameStopCollections(accountAddress)
    res.json(results);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// // Get the NFTs held by a specific Loopring account
// // :id - Loopring account ID (Number)
// // GET /api/account/:id/nfts
// // Returns an array of NFT IDs
router.get("/:id/collectionsFromNFTs", async (req, res) => {
  try {
    const { id } = req.params;
    const nfts = await getAccountNFTs(id);
    const results = await deriveCollectionsFromNFTs(nfts, id);
    res.json(results);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


// Get the NFTs held by a specific Loopring account
// :id - Loopring account ID (Number)
// GET /api/account/:id/nfts
// Returns an array of NFT IDs
router.get("/:id/nfts", async (req, res) => {
  try {
    const { id } = req.params;
    const nfts = await getAccountNFTs(id);
    res.json(nfts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get the NFTs held by a specific Loopring account
// :id - Loopring account ID (Number)
// GET /api/account/:id/nfts
// Returns an array of NFT IDs
router.get("/:id/mintedNfts", async (req, res) => {
  try {
    const { id } = req.params;
    const nfts = await getAccountMintedNFTs(Number(id));
    res.json(nfts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


// Export the router
module.exports = router;
