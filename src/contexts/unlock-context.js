import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useNetwork, usePublicClient, useSignMessage } from 'wagmi';
import { useAccountContext } from './account-context';

const UnlockContext = createContext(null);

export function LoopringUnlockProvider({ children }) {
  const [data, setData] = useState(undefined);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const { data: accountData } = useAccountContext();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);

  const status = useMemo(() => {
    if (loading) return 'loading';
    if (data) return 'unlocked';
    return 'locked';
  }, [loading, data]);

  const isUnlocked = useMemo(() => status === 'unlocked', [status]);

  const lock = useCallback(async () => {
    setData(undefined);
  }, []);

  useEffect(() => {
    if (data && (!chain || !address || data.address !== address || data.chainId !== chain.id)) {
      lock();
    }
  }, [data, address, chain, lock]);

  useAccount({
    onDisconnect: () => {
      lock();
    },
  });

  const unlock = useCallback(async () => {
    const { KEY_MESSAGE, LoopringAPI, LoopringExchangeAddress, generateKeyPair, isLoopringChain } = await import(
      '@loopexchange-labs/loopring-sdk'
    );

    if (!accountData || !address || !chain || chain.unsupported || !isLoopringChain(chain.id))
      throw new Error('not ready');

    setLoading(true);

    try {
      const api = new LoopringAPI(chain.id);
      const accInfo = accountData.accountInfo;

      const keySeed =
        accInfo.keySeed && accInfo.keySeed !== ''
          ? accInfo.keySeed
          : KEY_MESSAGE.replace('${exchangeAddress}', LoopringExchangeAddress[chain.id]).replace(
              '${nonce}',
              (accInfo.nonce - 1).toString()
            );

      const eddsaKey = await generateKeyPair({
        signMessageAsync,
        verifyMessage: publicClient.verifyMessage,
        keySeed,
        account: address,
        accountId: accInfo.accountId,
        chainId: chain.id,
        publicKey: accInfo.publicKey,
      });

      const { apiKey } = await api.accountApi.getUserApiKey(eddsaKey.sk, {
        accountId: accInfo.accountId,
      });

      const unlockData = {
        address,
        chainId: chain.id,
        apiKey,
        accountId: accInfo.accountId,
        sk: eddsaKey.sk,
        publicX: eddsaKey.formatedPx,
        publicY: eddsaKey.formatedPy,
      };

      setData(unlockData);
    } finally {
      setLoading(false);
    }
  }, [accountData, address, chain, publicClient.verifyMessage, signMessageAsync]);

  return (
    <UnlockContext.Provider
      value={useMemo(
        () => ({ isUnlocked, loading, data, unlock, lock, status }),
        [isUnlocked, loading, data, unlock, lock, status]
      )}
    >
      {children}
    </UnlockContext.Provider>
  );
}

export function useUnlockContext() {
  const contextValue = useContext(UnlockContext);

  if (!contextValue) {
    throw new Error('No unlock context found');
  }

  return contextValue;
}
