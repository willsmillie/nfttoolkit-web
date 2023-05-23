import React, { createContext, useState, useEffect } from 'react';
import * as Web3 from 'web3';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import { authenticate, getBalances } from '../utils/web3';

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const { activate, deactivate, active, account, library } = useWeb3React();
  const [authData, setAuthData] = useState({});
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    if (library?.provider && account && active) {
      const web3 = new Web3(library?.provider);
      authenticate(account, web3).then(({ apiKey, accountId }) => {
        setAuthData({ apiKey, accountId, web3 });
        getBalances({ apiKey, accountId }).then(async (res) => {
          const results = res.userNFTBalances;
          setBalances(results);
        });
      });
    }
  }, [library?.provider, account, active]);

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
      setAuthData({ apiKey: null, accountId: null });
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <AuthContext.Provider value={{ authData, balances, connect, disconnect }}>{props.children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
