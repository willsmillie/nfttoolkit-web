const express = require("express");

const router = express.Router();
const { getAccountNFTs, getAccountMintedNFTs, getNFTHolders } = require("../../utils/loopring/graphQL");
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


// Get the accounts held by a specific Loopring account
// :id - Loopring account ID (Number)
// GET /api/account/:id/whales
// Returns an array of accounts holding the most nfts
router.get("/:id/whales", async (req, res) => {
  try {
    const { id } = req.params;
    const nftIds = await getAccountMintedNFTs(Number(id)).then(res => res.map(e => e.nftId))    
    const holdersResults = await Promise.all(nftIds.map(getNFTHolders)); // Await the Promise.all for the results

    // Aggregate the results by address
    const aggregatedResults = holdersResults.reduce((accumulator, holderList) => {
      holderList.forEach(holder => {
        const { address, nftId, balance } = holder;
        if (!accumulator[address]) {
          accumulator[address] = {};
        }
        if (!accumulator[address][nftId]) {
          accumulator[address][nftId] = 0;
        }
        accumulator[address][nftId] += balance;
      });
      return accumulator;
    }, {});

    // Calculate the combined balances for each address
    const combinedBalances = {};
    for (const address in aggregatedResults) {
      combinedBalances[address] = Object.values(aggregatedResults[address]).reduce((sum, balance) => sum + balance, 0);
    }

    // Find the address with the highest combined balance
    let highestBalanceAddress = null;
    let highestBalance = 0;
    for (const address in combinedBalances) {
      if (combinedBalances[address] > highestBalance) {
        highestBalance = combinedBalances[address];
        highestBalanceAddress = address;
      }
    }

    // const sortedAddresses = combinedBalances.sort((a, b) => b - a);

    res.json(combinedBalances);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
});



// Export the router
module.exports = router;
