import PrivateKeyProvider from 'truffle-privatekey-provider';
import Web3 from 'web3';
import * as sdk from '@loopring-web/loopring-sdk';
import LoopringAPIClass from './loopring.js';
import dotenv from 'dotenv';
// import fetch from 'node-fetch';
import axios from 'axios';
import { RateLimit as ratelimit } from 'async-sema';
// configure a limit of maximum 5 requests / second
const limit = ratelimit(5);
// load the dotenv
dotenv.config();
// Env vars
const { INFURA_PROJECT_ID, ETH_ACCOUNT_PRIVATE_KEY, ETH_ACCOUNT_ADDRESS, LOOPRING_API_KEY } = process.env;
const provider = new PrivateKeyProvider(ETH_ACCOUNT_PRIVATE_KEY, `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const web3 = new Web3(provider);
const { exchangeAPI, userAPI, walletAPI, nftAPI } = LoopringAPIClass;
const signatureKeyPairMock = async function (exchangeAddress, accInfo) {
    if (!accInfo)
        console.error('NO ACCINFO');
    const opts = {
        web3: web3,
        address: accInfo.owner,
        keySeed: accInfo.keySeed ||
            sdk.GlobalAPI.KEY_MESSAGE.replace('${exchangeAddress}', exchangeAddress).replace('${nonce}', (accInfo.nonce - 1).toString()),
        walletType: sdk.ConnectorNames.MetaMask,
        accountId: Number(accInfo.accountId),
        chainId: sdk.ChainId.MAINNET,
    };
    const eddsaKey = await sdk.generateKeyPair(opts);
    return eddsaKey;
};
// Authenticate the account defined in your .env file
export const authenticate = async () => {
    if (LOOPRING_API_KEY == null) {
        try {
            const { exchangeInfo } = await exchangeAPI.getExchangeInfo();
            const { accInfo } = await exchangeAPI.getAccount({ owner: ETH_ACCOUNT_ADDRESS });
            const eddsaKey = await signatureKeyPairMock(exchangeInfo.exchangeAddress, accInfo);
            const { apiKey } = await userAPI.getUserApiKey({ accountId: accInfo.accountId }, eddsaKey.sk);
            process.env.LOOPRING_API_KEY = apiKey;
            return { ...accInfo, apiKey };
        }
        catch (error) {
            console.error(error);
            return { apiKey: null };
        }
    }
    else {
        return { apiKey: LOOPRING_API_KEY };
    }
};
// returns the NFT balances given an L2 accountId
export const getBalances = async (accountId) => {
    return await userAPI.getUserNFTBalances({ accountId, limit: 500 }, LOOPRING_API_KEY);
};
// retreive ipfs metadata given a tokenId
export const getMetadataForNFT = async function (nftId) {
    const cid = nftAPI.ipfsNftIDToCid(nftId);
    const metadata = await axios
        .get(`https://gateway.ipfs.io/ipfs/${cid}`)
        .then((x) => x.data)
        .catch((error) => console.log(error));
    return metadata;
};
// retreive holders given a tokenId
export const getHoldersForNFTData = async (nftData) => {
    const results = [];
    let totalNum = null;
    while (totalNum === null || results.length < totalNum) {
        const url = `https://api3.loopring.io/api/v3/nft/info/nftHolders?nftData=${nftData}&offset=${results.length}&limit=500`;
        const res = await makeRequest(url);
        if (!totalNum && res?.totalNum)
            totalNum = res.totalNum;
        if (res?.nftHolders?.length === 0 || res?.nftHolders == undefined)
            break;
        results.push(...(res?.nftHolders ?? []));
    }
    return results;
};
// export const resolveAccountIds = async (accountIds) => {
//   const addresses: any = await Promise.all(accountIds.map(async (id) => await getAccount(id)));
//   return addresses;
// };
// Resolves a loopring account Id to a wallet address
export const getAccount = async (accountId) => {
    if (!accountId)
        return;
    const url = `https://api3.loopring.io/api/v3/account?accountId=${accountId}`;
    return await makeRequest(url);
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
export const resolveENS = async (domain) => domain.toLowerCase().endsWith('.eth') ?
    (await walletAPI.getAddressByENS({
        fullName: domain.toLowerCase(),
    })).address :
    domain;
// Convenience for making the HTTP req header
const makeHeader = (apiKey = LOOPRING_API_KEY) => {
    return {
        'X-API-KEY': apiKey,
    };
};
// Factory method to create a request, adding the header and converting the response to JSON
const makeRequest = async (url) => {
    await limit();
    return await axios
        .get(encodeURI(url), {
        headers: makeHeader(),
    })
        .then((res) => res.data);
};
//# sourceMappingURL=web3.js.map