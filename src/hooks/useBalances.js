import { useEffect, useState } from 'react';
// @web3-react
import * as Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import { authenticate, getBalances } from '../utils/web3';

// ----------------------------------------------------------------------
export function useBalances() {
  const { account, library } = useWeb3React();
  const [balances, setBalances] = useState(null);

  useEffect(() => {
    if (library?.provider && account) {
      const web3 = new Web3(library?.provider);
      authenticate(account, web3)
        .then(({ apiKey, accountId }) => getBalances({ apiKey, accountId, web3 }))
        .then(async (balances) => {
          const results = balances.userNFTBalances;
          setBalances(results);
        });
    }
  }, [library?.provider, account]);

  return balances;
}
