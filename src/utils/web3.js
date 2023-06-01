/* eslint-disable no-template-curly-in-string */
import * as sdk from '@loopring-web/loopring-sdk';
import axios from 'axios';
import { RateLimit as limit } from 'async-sema';

// Env vars
const CHAIN_ID = 1;

const exchangeAPI = new sdk.ExchangeAPI({ chainId: CHAIN_ID });
const userAPI = new sdk.UserAPI({ chainId: CHAIN_ID });
const walletAPI = new sdk.WalletAPI({ chainId: CHAIN_ID });
const nftAPI = new sdk.NFTAPI({ chainId: CHAIN_ID });

export const ipfsNftIDToCid = (nftId) => nftAPI.ipfsNftIDToCid(nftId);
export const getAccountById = (accountId) => exchangeAPI.getAccount({ accountId });
export const getAccountByAddress = async (address) => exchangeAPI.getAccount({ owner: address });

const signatureKeyPairMock = async (accInfo, exchangeAddress, web3) => {
  const keySeed = accInfo.keySeed || 'Connect to NFTToolKit';

  const eddsaKey = await sdk.generateKeyPair({
    web3,
    address: accInfo.owner,
    keySeed,
    walletType: sdk.ConnectorNames.Unknown,
    chainId: parseInt(CHAIN_ID, 10),
  });

  return eddsaKey;
};

// Authenticate the account defined in your .env file
export const authenticate = async (address, web3) => {
  // const restoredKey = localStorage.getItem('loopring_api_key');
  // if (restoredKey != null) return { apiKey: restoredKey };

  try {
    // get info from chain / init of LoopringAPI contains process.env.CHAIN_ID
    const { exchangeInfo } = await exchangeAPI.getExchangeInfo();
    const { exchangeAddress } = exchangeInfo;

    // Get the accountId and other metadata needed for sig
    // debug("ETH_ACCOUNT_ADDRESS", ETH_ACCOUNT_ADDRESS);
    const { accInfo } = await exchangeAPI.getAccount({
      owner: address,
    });
    const { accountId } = accInfo;

    // Auth to API via signature
    const eddsaKey = await signatureKeyPairMock(accInfo, exchangeAddress, web3);
    const { apiKey } = await userAPI.getUserApiKey({ accountId }, eddsaKey.sk);
    // localStorage.setItem('loopring_api_key', apiKey);

    return { ...accInfo, apiKey, eddsaKey, exchangeAddress };
  } catch (error) {
    console.error(error.message);
    return {};
  }
};

export const getBalances = async ({ accountId, apiKey }) => {
  const pageLimit = 50;
  const totalItems = [];
  let currentPage = 1;
  let totalPages = 1;

  const rateLimit = limit(5); // Limit to 5 requests per second

  while (currentPage <= totalPages) {
    await rateLimit(); // Wait for rate limit to be available

    const response = await userAPI.getUserNFTBalances({ accountId, limit: pageLimit, page: currentPage }, apiKey);

    if (response.userNFTBalances) totalItems.push(...response.userNFTBalances);

    // Check if there are more pages to fetch
    if (response.totalNum > currentPage * pageLimit) {
      totalPages = Math.ceil(response.totalNum / pageLimit);
      currentPage++;
    } else {
      break;
    }
  }

  return totalItems;
};
export const isAdmin = (account) => {
  const id = process.env.REACT_APP_ETH_ACCOUNT_ADDRESS;
  return account === id;
};

// resolve an ens domain to hex address
export const resolveENS = async (domain) =>
  domain.toLowerCase().endsWith('.eth')
    ? (
        await walletAPI.getAddressByENS({
          fullName: domain.toLowerCase(),
        })
      ).address
    : domain;

// retreive ipfs metadata given a tokenId
export const getMetadataForNFT = async function (nftId) {
  const cid = nftAPI.ipfsNftIDToCid(nftId);
  const metadata = await axios
    .get(`https://nfttoolkit.infura-ipfs.io/ipfs/${cid}`)
    .then((x) => x.data)
    .catch((error) => console.log(error));

  return metadata;
};
