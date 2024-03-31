import * as sdk from '@loopring-web/loopring-sdk';
export default class LoopringAPIClass {
}
// public static contractAPI: sdk.ContractAPI;
LoopringAPIClass.__chainId__ = sdk.ChainId.MAINNET;
LoopringAPIClass.initApi = (chainId = sdk.ChainId.MAINNET) => {
    LoopringAPIClass.userAPI = new sdk.UserAPI({ chainId });
    LoopringAPIClass.exchangeAPI = new sdk.ExchangeAPI({ chainId });
    LoopringAPIClass.globalAPI = new sdk.GlobalAPI({ chainId });
    LoopringAPIClass.ammpoolAPI = new sdk.AmmpoolAPI({ chainId });
    LoopringAPIClass.walletAPI = new sdk.WalletAPI({ chainId });
    LoopringAPIClass.wsAPI = new sdk.WsAPI({ chainId });
    LoopringAPIClass.nftAPI = new sdk.NFTAPI({ chainId });
    LoopringAPIClass.delegate = new sdk.DelegateAPI({ chainId });
    LoopringAPIClass.whitelistedUserAPI = new sdk.WhitelistedUserAPI({ chainId });
    LoopringAPIClass.__chainId__ = chainId;
    // LoopringAPI.contractAPI = ContractAPI;
};
//# sourceMappingURL=loopring.js.map