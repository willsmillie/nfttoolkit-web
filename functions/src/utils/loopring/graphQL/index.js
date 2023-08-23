const { GraphQLClient } = require("graphql-request");
const { getAccountNFTsQuery, getAccountMintedNFTsQuery } = require("./nfts");

const loopringGraphEndpoint = "https://api.thegraph.com/subgraphs/name/loopring/loopring";

/**
 * Fetches the NFTs associated with an account.
 * @param {string} id - The ID of the account.
 * @return {Promise<Array<string>>} - An array of NFT IDs.
 * @throws {Error} - If an error occurs while fetching the NFTs.
 */
async function getAccountNFTs(id) {
  try {
    const first = 100; // Number of results per page
    let skip = 0; // Number of results to skip

    const client = new GraphQLClient(loopringGraphEndpoint);
    let nfts = [];

    // Fetch all pages of results
    while (true) {
      const variables = { id, first, skip };
      const data = await client.request(getAccountNFTsQuery, variables);
      const slots = data?.account?.slots;

      if (!slots || slots.length === 0) {
        break; // No more results, exit the loop
      }

      const filteredSlots = slots.filter((slot) => slot.nft && slot.nft.nftID !== null);
      // Compute NFT data hash for each NFT
      const computedBalances = filteredSlots
          .map(({ balance, nft }) => ({
            balance,
            nftId: nft.nftID,
            minter: nft.mintedAtTransaction.minter.address,
            minterAccountId: nft.mintedAtTransaction.minter.id,
            tokenAddress: nft.mintedAtTransaction.tokenAddress,
          }));

      nfts = nfts.concat(computedBalances);
      skip += first;
    }

    return nfts.reverse();
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while fetching NFTs");
  }
}

/**
 * Fetches the NFTs minted by an account.
 * @param {string} accountId - The ID of the minter account.
 * @return {Promise<Array<string>>} - An array of NFT IDs minted by the account.
 * @throws {Error} - If an error occurs while fetching the minted NFTs.
 */
async function getAccountMintedNFTs(accountId) {
  try {
    const first = 100; // Number of results per page
    let skip = 0; // Number of results to skip

    const client = new GraphQLClient(loopringGraphEndpoint);
    let mints = []; // Store all mints

    // Convert accountId to integer
    const accountIdInt = parseInt(accountId, 10);

    // Fetch all pages of results
    while (true) {
      const variables = { accountId: accountIdInt, first, skip };
      const data = await client.request(getAccountMintedNFTsQuery, variables);
      const fetchedMints = data?.mints || [];

      if (fetchedMints.length === 0) {
        break; // No more results, exit the loop
      }

      // Compute NFT data hash for each minted NFT
      const computedMints = fetchedMints.map((mint) => ({ nftId: mint.nftID, minter: mint.minter.address, tokenAddress: mint.tokenAddress }));

      mints = mints.concat(computedMints);
      skip += first;
    }

    return mints.reverse();
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while fetching minted NFTs");
  }
}

module.exports = { getAccountNFTs, getAccountMintedNFTs };
