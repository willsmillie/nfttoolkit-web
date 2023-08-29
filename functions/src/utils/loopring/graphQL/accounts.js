const { gql } = require("graphql-request");

const getNFTHoldersQuery = gql`
  query GetNFTHolders($nftID: String!) {
    nonFungibleTokens(where: { nftID: $nftID }) {
      nftID
      slots {
        nft {
          nftID
        }
        account {
          address
        }
        balance
      }
    }
  }
`;

module.exports = { getNFTHoldersQuery };
