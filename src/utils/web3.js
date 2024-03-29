/* eslint-disable no-template-curly-in-string */
import * as sdk from '@loopring-web/loopring-sdk';
import { RateLimit as limit } from 'async-sema';

// Env vars
const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID) || 1;

export const exchangeAPI = new sdk.ExchangeAPI({ chainId: CHAIN_ID });
export const userAPI = new sdk.UserAPI({ chainId: CHAIN_ID });
export const walletAPI = new sdk.WalletAPI({ chainId: CHAIN_ID });
export const nftAPI = new sdk.NFTAPI({ chainId: CHAIN_ID });

export const getAccountById = (accountId) => exchangeAPI.getAccount({ accountId });
export const getAccountByAddress = async (address) => exchangeAPI.getAccount({ owner: address }).then((e) => e.accInfo);
export const ipfsNftIDToCid = (nftId) => {
  if (!nftId || nftId?.length === 0) return '';
  return nftAPI.ipfsNftIDToCid(nftId);
};

export const signatureKeyPairMock = async (accInfo, exchangeAddress, web3) => {
  const keySeed = accInfo.keySeed || 'Connect to NFTToolKit';

  const eddsaKey = await sdk.generateKeyPair({
    web3,
    address: accInfo.owner,
    keySeed,
    walletType: sdk.ConnectorNames.Unknown,
    chainId: CHAIN_ID,
  });

  return eddsaKey;
};

export const getBalances = async ({ accountId, apiKey }) => {
  const pageLimit = 50;
  const totalItems = [];
  let currentPage = 1;
  let totalPages = 1;

  const rateLimit = limit(5); // Limit to 5 requests per second

  while (currentPage <= totalPages) {
    await rateLimit(); // Wait for rate limit to be available

    const response = await userAPI.getUserNFTBalances(
      { accountId, limit: pageLimit, page: currentPage, metadata: true },
      apiKey
    );

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

// resolve an ens domain to hex address
export const resolveENS = async (domain) =>
  domain?.toLowerCase().endsWith('.eth')
    ? (
        await walletAPI.getAddressByENS({
          fullName: domain.toLowerCase(),
        })
      ).address
    : domain;

// get transfer fees
export const getFee = ({ accountId, apiKey, requiresActivation }) =>
  userAPI.getNFTOffchainFeeAmt(
    {
      accountId,
      requestType: requiresActivation ? sdk.OffchainNFTFeeReqType.NFT_TRANSFER : sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
      amount: '0',
    },
    apiKey
  );

export const getL1Assets = (address) =>
  // cURL (POST https://mainnet.infura.io/v3/YOUR-API-KEY)
  fetch(`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      id: 1,
      params: [address, 'latest'],
    }),
  })
    .then((res) => res.json())
    .catch(console.error);

export const resolveENSReverse = async (address) => {
  address = address?.toLowerCase();
  if (address?.startsWith('0x')) {
    const { ensName } = await walletAPI.getEnsByAddress({ owner: address });
    return ensName;
  }
  return address;
};
