import React, { createContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { RateLimit as ratelimit } from 'async-sema';
import * as Web3 from 'web3';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import { getFilesForGates, parseGatesFromNFTs } from 'src/utils/tokenGate';
import { authenticate, userAPI } from '../utils/web3';
import * as API from '../API';

const rateLimiter = ratelimit(5);

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const { activate, deactivate, library, account, active } = useWeb3React();
  const [authData, setAuthData] = useState({});
  const { apiKey } = authData;
  const [web3, setWeb3] = useState(null);

  const [nfts, setNFTs] = useState([]);
  const [mints, setMints] = useState([]);
  const [gateIds, setGateIds] = useState([]);
  const [files, setFiles] = useState([]);

  // paginator for loopring API requests
  const loopringFetcher = async (url) => {
    if (!apiKey) return {};

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    return response.json();
  };

  useEffect(() => {
    // Load the stored auth data from localStorage or any other storage mechanism
    const storedAuthData = JSON.parse(localStorage.getItem('authData'));

    if (storedAuthData) {
      // If storedAuthData exists, activate the wallet connection with the stored data
      // activate(storedAuthData.connector);
      setAuthData(storedAuthData);
    }

    // Cleanup function
    return () => deactivate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // authenticate the connected wallet against the loopring API
  useEffect(() => {
    if (library?.provider && account && active) {
      const _web3 = new Web3(library?.provider);
      setWeb3(_web3);
      authenticate(account, _web3).then(({ apiKey, accountId, eddsaKey }) => {
        setAuthData({ apiKey, accountId, account, eddsaKey });
        localStorage.setItem('authData', JSON.stringify({ apiKey, accountId, account, eddsaKey }));
      });
    }
  }, [library?.provider, account, active]);

  // fetch account data after authenticating
  useEffect(() => {
    function fetchData() {
      const { accountId } = authData;
      if (accountId?.length === 0 || !accountId) return;

      getAllNFTs(accountId)
        .then((results) => {
          setNFTs(results);
          parseGatesFromNFTs(results).then(setGateIds);
        })
        .catch(console.error);

      API.getMints(accountId).then(setMints);
      // get the users gated files
      // API.getFiles(accountId).then(setFiles).catch(console.error);
    }

    fetchData();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData]);

  useEffect(() => getFilesForGates(gateIds).then(setFiles), [gateIds]);

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });

  // connect to the injected wallet (gamestop)
  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.error(ex);
    }
  }

  // disconnect the wallet, nullify the api keys
  async function disconnect() {
    try {
      deactivate();
      setAuthData({ apiKey: null, accountId: null });
      localStorage.setItem('authData', JSON.stringify({}));
    } catch (ex) {
      console.error(ex);
    }
  }

  // fetch held NFTs for a given accountId
  const fetchNFTs = async (accountId, page = 0, limit = 50) => {
    const response = await userAPI.getUserNFTBalances(
      {
        accountId,
        offset: page * limit,
        limit,
        metadata: true,
      },
      apiKey
    );
    return {
      totalNum: response.totalNum,
      results: response.userNFTBalances,
    };
  };

  // fetch minted NFTs for a given accountId
  const fetchMints = async (accountId, page = 0, limit = 50) => {
    const response = await userAPI.getUserNFTTransactionHistory(
      {
        accountId,
        offset: page * limit,
        limit,
        metadata: true,
        types: 'mint',
      },
      apiKey
    );

    const mints = response.userNFTTxs;
    const resolvedMetadata = await getTokenInfo(mints.map((e) => e.nftData).join(','));
    const enrichedResults = mints.map((mint) => ({
      ...mint,
      ...resolvedMetadata.find((e) => e.nftData === mint.nftData),
    }));

    return {
      totalNum: response.totalNum,
      results: enrichedResults,
    };
  };

  // hook for fetching users balances in a paginated manner
  // https://docs.loopring.io/en/dex_apis/getUserNftBalances.html
  const useBalances = (accountId) =>
    useQuery(['nfts', accountId], () => API.getNFTs(accountId), {
      enabled: !!accountId, // Enable the query only when accountId is truthy
      refetchOnWindowFocus: false, // Do not refetch when the window regains focus
    });

  // call the endpoint which computes the nft data
  const getNFTData = async ({ minter, tokenAddress, nftId }) => {
    const url = `https://api3.loopring.io/api/v3/nft/info/nftData?minter=${minter}&tokenAddress=${tokenAddress}&nftId=${nftId}`;
    // call the loopring api
    const res = await loopringFetcher(url).catch(console.warn); // eslint-disable-line no-await-in-loop
    return res;
  };

  // fetch token info by nftDatas
  // https://docs.loopring.io/en/dex_apis/getNftsInfo.html
  const getTokenInfo = async (nftDatas) => {
    if (nftDatas?.length === 0) return {};
    // call the loopring api
    const url = `https://api3.loopring.io/api/v3/nft/info/nfts?nftDatas=${nftDatas}`;
    const res = await loopringFetcher(url).catch(console.warn); // eslint-disable-line no-await-in-loop
    return res;
  };

  const getAllNFTs = async (accountId) => {
    let totalNum = null;
    const results = [];

    let page = 0;
    const limit = 50;

    while (totalNum == null || results.length < totalNum) {
      await rateLimiter(); // Wait for rate limit to be available

      const { totalNum: count, userNFTBalances } = await userAPI.getUserNFTBalances(
        {
          accountId,
          offset: page * limit,
          limit,
          metadata: true,
        },
        apiKey
      );

      if (!totalNum) totalNum = count;
      results.push(...userNFTBalances);
      page += 1;
    }

    return results;
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        accountId: authData.accountId,
        apiKey: authData.apiKey,
        account: account?.toLowerCase() ?? authData.account?.toLowerCase(),
        active: !!authData.accountId && !!authData.apiKey,
        nfts,
        mints,
        fetchMints,
        fetchNFTs,
        useBalances,
        getNFTData,
        files,
        connect,
        disconnect,
        web3,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
