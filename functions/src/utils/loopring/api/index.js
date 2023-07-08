const PrivateKeyProvider = require("truffle-privatekey-provider");
const Web3 = require("web3");
const sdk = require("@loopring-web/loopring-sdk");
const { RateLimit: ratelimit } = require("async-sema");

const apiKey = process.env.LOOPRING_API_KEY;
// configure a limit of maximum 5 requests / second
const limit = ratelimit(5);

// setup dot env
require("dotenv").config();

// Env vars
const {
  INFURA_PROJECT_ID,
  ETH_ACCOUNT_PRIVATE_KEY,
  ETH_ACCOUNT_ADDRESS,
  CHAIN_ID,
} = (() => {
  const { env } = process;
  return {
    ...env,
    CHAIN_ID: parseInt(env.CHAIN_ID, 10),
    VERBOSE: /^\s*(true|1|on)\s*$/i.test(env.VERBOSE),
  };
})();

const exchangeAPI = new sdk.ExchangeAPI({ chainId: CHAIN_ID });
const userAPI = new sdk.UserAPI({ chainId: CHAIN_ID });
const walletAPI = new sdk.WalletAPI({ chainId: CHAIN_ID });
const nftAPI = new sdk.NFTAPI({ chainId: CHAIN_ID });

const signatureKeyPairMock = async (accInfo, exchangeAddress) => {
  // initialize provider
  const provider = new PrivateKeyProvider(
      ETH_ACCOUNT_PRIVATE_KEY,
      `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
  );

  const web3 = new Web3(provider);

  const keySeed =
    accInfo.keySeed ||
    sdk.GlobalAPI.KEY_MESSAGE.replace(
        "${exchangeAddress}",
        exchangeAddress,
    ).replace("${nonce}", (accInfo.nonce - 1).toString());
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
const authenticate = async () => {
  if (process.env.LOOPRING_API_KEY) {
    console.log("Found apiKey in env");
    return process.env.LOOPRING_API_KEY;
  }
  console.log("no apiKey in env, falling back to authenticating");
  try {
    // get info from chain / init of LoopringAPI contains process.env.CHAIN_ID
    const { exchangeInfo } = await exchangeAPI.getExchangeInfo();
    // exchange address can change over time
    const { exchangeAddress } = exchangeInfo;

    // Get the accountId and other metadata needed for sig
    // debug("ETH_ACCOUNT_ADDRESS", ETH_ACCOUNT_ADDRESS);
    const { accInfo } = await exchangeAPI.getAccount({
      owner: ETH_ACCOUNT_ADDRESS,
    });
    // debug("accInfo", accInfo);
    const { accountId } = accInfo;

    // Auth to API via signature
    const eddsaKey = await signatureKeyPairMock(accInfo, exchangeAddress);
    const { apiKey } = await userAPI.getUserApiKey({ accountId }, eddsaKey.sk);
    process.env.LOOPRING_API_KEY = apiKey;
    return { ...accInfo, apiKey, eddsaKey, exchangeAddress };
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getAccountCollections = async (accountId) => {
  let totalNum = null;
  const results = [];

  while (totalNum == null || results.length < totalNum) {
    await limit(); // Wait for rate limit to be available
    const { totalNum: count, collections } = await userAPI.getUserNFTCollection({ accountId, limit: 50, offset: results.length }, apiKey);

    if (!totalNum) totalNum = count;
    results.push(...collections);
  }
  return results.filter((e)=>e.id !== -1);
};

module.exports = {
  exchangeAPI,
  userAPI,
  walletAPI,
  authenticate,
  nftAPI,
  sdk,
  getAccountCollections,
};
