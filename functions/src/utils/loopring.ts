import * as sdk from '@loopring-web/loopring-sdk';

export default class LoopringAPIClass {
  public static userAPI: sdk.UserAPI;
  public static exchangeAPI: sdk.ExchangeAPI;
  public static ammpoolAPI: sdk.AmmpoolAPI;
  public static walletAPI: sdk.WalletAPI;
  public static wsAPI: sdk.WsAPI;
  public static nftAPI: sdk.NFTAPI;
  public static delegate: sdk.DelegateAPI;
  public static globalAPI: sdk.GlobalAPI;
  public static whitelistedUserAPI: sdk.WhitelistedUserAPI;
  // public static contractAPI: sdk.ContractAPI;
  public static __chainId__: sdk.ChainId = sdk.ChainId.MAINNET;
  public static initApi = (chainId: sdk.ChainId = sdk.ChainId.MAINNET) => {
    LoopringAPIClass.userAPI = new sdk.UserAPI({chainId});
    LoopringAPIClass.exchangeAPI = new sdk.ExchangeAPI({chainId});
    LoopringAPIClass.globalAPI = new sdk.GlobalAPI({chainId});
    LoopringAPIClass.ammpoolAPI = new sdk.AmmpoolAPI({chainId});
    LoopringAPIClass.walletAPI = new sdk.WalletAPI({chainId});
    LoopringAPIClass.wsAPI = new sdk.WsAPI({chainId});
    LoopringAPIClass.nftAPI = new sdk.NFTAPI({chainId});
    LoopringAPIClass.delegate = new sdk.DelegateAPI({chainId});
    LoopringAPIClass.whitelistedUserAPI = new sdk.WhitelistedUserAPI({chainId});
    LoopringAPIClass.__chainId__ = chainId;
    // LoopringAPI.contractAPI = ContractAPI;
  };
}
