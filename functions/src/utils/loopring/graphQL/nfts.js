const { gql } = require("graphql-request");

const getAccountNFTsQuery = gql`
  query GetAccountNFTs($id: ID!, $first: Int!, $skip: Int!) {
    account(id: $id) {
      slots(first: $first, skip: $skip) {
        createdAt
        balance
        nft {
          nftID
          mintedAtTransaction {
            minter {
              id
              address
            }
            tokenAddress
          }
        }
      }
    }
  }
`;

const getAccountMintedNFTsQuery = gql`
  query GetAccountMintedNFTs($accountId: Int!, $first: Int!, $skip: Int!) {
    mints: mintNFTs(where: { minterAccountID: $accountId }, first: $first, skip: $skip) {
      nftID
      tokenAddress
      minter {
        id
        address
      }
    }
  }
`;


module.exports = { getAccountNFTsQuery, getAccountMintedNFTsQuery };
