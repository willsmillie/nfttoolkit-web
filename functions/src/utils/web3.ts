import PrivateKeyProvider from 'truffle-privatekey-provider';
import Web3 from 'web3';
import * as sdk from '@loopring-web/loopring-sdk';
import LoopringAPIClass from './loopring.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { RateLimit as ratelimit } from 'async-sema';

// configure a limit of maximum 5 requests / second
const limit = ratelimit(5);

// load the dotenv
dotenv.config();

// Env vars
const { INFURA_PROJECT_ID, ETH_ACCOUNT_PRIVATE_KEY, ETH_ACCOUNT_ADDRESS } = process.env;
const provider = new PrivateKeyProvider(ETH_ACCOUNT_PRIVATE_KEY, `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const web3 = new Web3(provider);
const { exchangeAPI, userAPI, walletAPI, nftAPI } = LoopringAPIClass;

const signatureKeyPairMock = async function (exchangeAddress: string, accInfo: sdk.AccountInfo) {
  if (!accInfo) console.error('NO ACCINFO');
  const opts = {
    web3: web3,
    address: accInfo.owner,
    keySeed:
      accInfo.keySeed ||
      sdk.GlobalAPI.KEY_MESSAGE.replace('${exchangeAddress}', exchangeAddress).replace(
        '${nonce}',
        (accInfo.nonce - 1).toString()
      ),
    walletType: sdk.ConnectorNames.MetaMask,
    accountId: Number(accInfo.accountId),
    chainId: sdk.ChainId.MAINNET,
  };
  console.log(accInfo, opts);
  // debugger; // (sdk.generateKeyPair);
  const eddsaKey = await sdk.generateKeyPair(opts);

  console.log('eddsaKey', eddsaKey);
  return eddsaKey;
};

// Authenticate the account defined in your .env file
export const authenticate = async () => {
  if (!process.env.LOOPRING_API_KEY) {
    try {
      const { exchangeInfo } = await exchangeAPI.getExchangeInfo();
      const { accInfo } = await exchangeAPI.getAccount({ owner: ETH_ACCOUNT_ADDRESS });

      const eddsaKey = await signatureKeyPairMock(exchangeInfo.exchangeAddress, accInfo);
      console.log(eddsaKey);
      const { apiKey } = await userAPI.getUserApiKey({ accountId: accInfo.accountId }, eddsaKey.sk);
      // const { userNFTBalances } = await userAPI.getUserNFTBalances({ accountId: accInfo.accountId, limit: 20 }, apiKey);
      // console.log(userNFTBalances);

      process.env.LOOPRING_API_KEY = apiKey;
      return { ...accInfo, apiKey };
    } catch (error) {
      console.error(error);
      return { apiKey: null };
    }
  } else {
    return { apiKey: process.env.LOOPRING_API_KEY };
  }
};

// returns the NFT balances given an L2 accountId
export const getBalances = async (accountId: number) => {
  const { apiKey } = await authenticate();
  return await userAPI.getUserNFTBalances({ accountId, limit: 50 }, apiKey);
};

// retreive ipfs metadata given a tokenId
export const getMetadataForNFT = async function (token) {
  await limit();
  const cid = nftAPI.ipfsNftIDToCid(token.nftId ?? token);
  const metadata = await fetch(`https://gateway.ipfs.io/ipfs/${cid}`)
    .then((x) => x.json())
    .catch((error) => console.log(error));

  return metadata;
};

// retreive holders given a tokenId
export const getHoldersForNFTData = async function (nftData: string) {
  const { apiKey } = await authenticate();
  await limit();

  const results = [];
  let totalNum = null;

  // paginate requests get all the accounts
  while (totalNum === null || results.length < totalNum) {
    const url = `https://api3.loopring.io/api/v3/nft/info/nftHolders?nftData=${nftData}&offset=${results.length}`;
    const res: any = await makeRequest(url, apiKey);

    if (!totalNum && res.totalNum) totalNum = res.totalNum;
    if (res.nftHolders?.length === 0 || res.nftHolders == undefined) break;
    results.push(...(res?.nftHolders ?? []));
  }

  const addresses: any = await Promise.all(
    results.map(async (e) => {
      await limit();
      return await getAccount(apiKey, e.accountId);
    })
  );

  return addresses.map((e) => e.owner);
};

// Resolves a loopring account Id to a wallet address
const getAccount = async (apiKey, accountId) => {
  const url = `https://api3.loopring.io/api/v3/account?accountId=${accountId}`;
  return await makeRequest(url, apiKey);
};

// GET created nfts by account id
// const getMints = async (apiKey, accountId) => {
//   const results = [];
//   let totalNum = null;

//   while (totalNum === null || results.length < totalNum) {
//     // var url = `https://api3.loopring.io/api/v3/user/nft/mints?accountId=${accountId}&limit=25`;
//     // opting for balance due to a more preferable response signature
//     let url = `https://api3.loopring.io/api/v3/user/nft/balances?accountId=${accountId}&limit=50`;
//     const lastResult = results[results.length - 1];
//     if (lastResult) url = url + `&offset=${results.length}`;

//     const res = await makeRequest(url, apiKey);
//     if (!totalNum && res?.totalNum) totalNum = res.totalNum;
//     if (res?.data?.length === 0 || res?.data == undefined) break;

//     if (res.data) {
//       for (const i in res.data) {
//         const nft = res.data[i];
//         if (!results.includes((e) => e.id === nft.id)) {
//           results.push(nft);
//         }
//       }
//     }
//   }

//   // let minterOfTokens = results.filter((e) => {
//   //   return e.minter === process.env['ETH_ACCOUNT_ADDRESS'].toLowerCase();
//   // });

//   return results;
// };

// resolve an ens domain to hex address
export const resolveENS = async (domain: string) =>
  domain.toLowerCase().endsWith('.eth')
    ? (
        await walletAPI.getAddressByENS({
          fullName: domain.toLowerCase(),
        })
      ).address
    : domain;

// Convenience for making the HTTP req header
const makeHeader = (apiKey: string) => {
  return {
    'X-API-KEY': apiKey,
  };
};

// Factory method to create a request, adding the header and converting the response to JSON
const makeRequest = async (url: string, key: string) => {
  return await fetch(encodeURI(url), {
    method: 'GET',
    headers: makeHeader(key),
  })
    .then((res) => res.json())
    .catch(console.error);
};
