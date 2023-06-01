import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { RateLimit as ratelimit } from 'async-sema';
import * as Web3 from 'web3';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import {
  authenticate,
  getBalances,
  getAccountById,
  getAccountByAddress,
  getMetadataForNFT,
  resolveENS,
} from '../utils/web3';
import stringToArray from '../utils/stringToArray';

// configure a limit of maximum 5 requests / second
const limit = ratelimit(5);

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const { activate, deactivate, active, account, library } = useWeb3React();
  const [authData, setAuthData] = useState({});
  const [balances, setBalances] = useState([]);
  const [ipfsData, setIPFSData] = useState({});

  useEffect(() => {
    if (library?.provider && account && active) {
      const web3 = new Web3(library?.provider);
      authenticate(account, web3).then(({ apiKey, accountId }) => {
        setAuthData({ apiKey, accountId, web3 });
        getBalances({ apiKey, accountId }).then(async (res) => {
          setBalances(res);
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

  async function fetchIPFS(cid) {
    const ipfsSrc = `https://nfttoolkit.infura-ipfs.io/ipfs/${cid}`;
    try {
      const response = await fetch(ipfsSrc);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIPFSData({ ...ipfsData, cid: data });
      return data;
    } catch (error) {
      console.error('Error:', error);
      // Handle the error
      return error;
    }
  }

  const getHoldersForNFTData = async (nftData) => {
    const results = [];
    let totalNum = null;
    const batchSize = 500;
    let offset = 0;

    while (totalNum === null || results.length < totalNum) {
      console.log(`fetching ${nftData} page: ${offset / batchSize}`);
      const url = `https://api3.loopring.io/api/v3/nft/info/nftHolders?nftData=${nftData}&offset=${offset}&limit=${batchSize}`;
      const res = await makeRequest(url); // eslint-disable-line no-await-in-loop

      if (!totalNum && res?.totalNum) totalNum = res.totalNum;
      if (res?.nftHolders?.length === 0 || res?.nftHolders === undefined) break;
      results.push(...(res?.nftHolders ?? []));

      offset += batchSize;
    }

    return results;
  };
  // get accounts ids
  const getAccountsByIds = async (accountIds) => {
    const reqs = [];
    if (accountIds?.length === 0) return;
    accountIds.forEach((acct) => {
      reqs.push(getAccountById(acct));
    });

    return Promise.all(reqs);
  };

  //  Convenience for making the HTTP req header
  const makeHeader = (apiKey) => ({
    'X-API-KEY': apiKey,
  });

  const makeRequest = async (url) => {
    await limit();
    return axios
      .get(encodeURI(url), {
        headers: makeHeader(authData.apiKey),
      })
      .then((res) => res.data);
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        account,
        active,
        balances,
        connect,
        disconnect,
        ipfsData,
        fetchIPFS,
        getBalances,
        getMetadataForNFT,
        getHoldersForNFTData,
        getAccountsByIds,
        getAccountByAddress,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
