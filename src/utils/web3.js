/* eslint-disable no-template-curly-in-string */
import * as sdk from '@loopring-web/loopring-sdk';
// Env vars
const CHAIN_ID = 1;

const exchangeAPI = new sdk.ExchangeAPI({ chainId: CHAIN_ID });
const userAPI = new sdk.UserAPI({ chainId: CHAIN_ID });
// const walletAPI = new sdk.WalletAPI({ chainId: CHAIN_ID });
// const nftAPI = new sdk.NFTAPI({ chainId: CHAIN_ID });

const signatureKeyPairMock = async (accInfo, exchangeAddress, web3) => {
  const keySeed =
    accInfo.keySeed ||
    sdk.GlobalAPI.KEY_MESSAGE.replace('${exchangeAddress}', exchangeAddress).replace(
      '${nonce}',
      (accInfo.nonce - 1).toString()
    );
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
  const balances = await userAPI.getUserNFTBalances({ accountId, limit: 50 }, apiKey);
  return balances;
};

export const isAdmin = (account) => {
  const id = process.env.REACT_APP_ETH_ACCOUNT_ADDRESS;
  return account === id;
};
