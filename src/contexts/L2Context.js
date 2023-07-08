import React, { createContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import _ from 'lodash';
import { RateLimit as ratelimit } from 'async-sema';
import * as Web3 from 'web3';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';
import { authenticate, getAccountById, getAccountByAddress, userAPI, nftAPI } from '../utils/web3';
import { ipfsToHttp } from '../utils/ipfs';
import { parseCollectionId, fetchTokenMetadata, fetchTokenCollectionMetadata } from '../hooks/useTokenResolver';
import * as API from '../API';
import { db } from '../utils/firebase';

const rateLimiter = ratelimit(5);

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const { activate, deactivate, library, account, active } = useWeb3React();
  const [authData, setAuthData] = useState({});
  const { apiKey } = authData;

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

  // hook for fetching users balances in a paginated manner
  // https://docs.loopring.io/en/dex_apis/getUserNftBalances.html
  const useBalances = (accountId) =>
    useQuery(['nfts', accountId], () => API.getNFTs(accountId), {
      enabled: !!accountId, // Enable the query only when accountId is truthy
      refetchOnWindowFocus: false, // Do not refetch when the window regains focus
    });

  // call the endpoint which computes the nft data
  const getNFTData = async ({ minter, tokenAddress, nftId }) => {
    const url = `https://api3.loopring.io/api/v3/nft/info/nftData?minter=${minter}&tokenAddress=${tokenAddress}&nftId=${nftId}&offset=`;
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
      const web3 = new Web3(library?.provider);
      authenticate(account, web3).then(({ apiKey, accountId }) => {
        setAuthData({ apiKey, accountId, web3 });

        localStorage.setItem('authData', JSON.stringify({ apiKey, accountId, account }));
      });
    }
  }, [library?.provider, account, active]);

  const [nfts, setNFTs] = useState([]);
  const [mints, setMints] = useState([]);
  const [gateIds, setGateIds] = useState([]);
  const [files, setFiles] = useState([]);

  // fetch account data after authenticating
  useEffect(() => {
    function fetchData() {
      const { accountId, account, apiKey } = authData;
      if (accountId?.length === 0 || !accountId) return;

      // get the users current holdings

      getAllNFTs(accountId, apiKey)
        .then((results) => {
          setNFTs(results);

          setMints(results?.filter((e) => e.minter?.toLowerCase() === account?.toLowerCase()));

          parseGatesFromNFTs(results).then(setGateIds);
        })
        .catch(console.error);

      // get the users gated files
      // API.getFiles(accountId).then(setFiles).catch(console.error);
    }

    fetchData();

    return () => {};
  }, [authData]);

  useEffect(() => {
    async function fetchFiles() {
      getFilesForGates(gateIds).then(setFiles);
    }

    fetchFiles();
  }, [gateIds]);

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

  // snapshot the holders of a given token via nftData param
  // automatically fetches all paginated results
  const getHoldersForNFTData = async (nftData) => {
    const results = [];
    let totalNum = null;
    const batchSize = 500;
    let offset = 0;

    while (totalNum === null || results.length < totalNum) {
      console.log(`fetching ${nftData} page: ${offset / batchSize}`);
      const url = `https://api3.loopring.io/api/v3/nft/info/nftHolders?nftData=${nftData}&offset=${offset}&limit=${batchSize}`;
      const res = await loopringFetcher(url); // eslint-disable-line no-await-in-loop

      if (!totalNum && res?.totalNum) {
        const newTotal = res.totalNum;
        totalNum = newTotal;
      }
      if (res?.nftHolders?.length === 0 || res?.nftHolders === undefined) break;
      results.push(...(res?.nftHolders ?? []));

      offset += batchSize;
    }

    return results;
  };

  // resolve account 0x addresses via a list of account Ids (loopring account 12345)
  async function getAccountsByIds(accountIds) {
    if (accountIds?.length === 0) return [];
    const reqs = accountIds.map((acct) => getAccountById(acct));
    return Promise.all(reqs);
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
        getTokenInfo,
        files,
        connect,
        disconnect,
        getHoldersForNFTData,
        getAccountsByIds,
        getAccountByAddress,
        userAPI,
        nftAPI,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

const getAllNFTs = async (accountId, apiKey) => {
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

const getFilesForGates = async (gateIds) => {
  try {
    const filesRef = db.collection('files');
    const batchSize = 30; // Maximum number of values in each batch

    // Split the gateIds into multiple batches
    const gateIdBatches = [];
    for (let i = 0; i < gateIds.length; i += batchSize) {
      const batch = gateIds.slice(i, i + batchSize);
      gateIdBatches.push(batch);
    }

    // Perform multiple queries for each batch of gateIds
    const queries = gateIdBatches.map((batch) =>
      filesRef.where('gateIds', 'array-contains-any', batch).orderBy('dateModified', 'desc').get()
    );

    // Execute all queries concurrently using Promise.all()
    const querySnapshots = await Promise.all(queries);

    // Merge the snapshots into a single result
    const mergedSnapshot = querySnapshots.reduce((result, snapshot) => {
      snapshot.forEach((doc) => {
        result.push(doc);
      });
      return result;
    }, []);

    const files = [];
    mergedSnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });

    return files.sort((a, b) => b.dateModified.toDate() - a.dateModified.toDate());
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

const TIMEOUT_DELAY = 5000; // 5 seconds

// get all gateIds from nfts
const parseGatesFromNFTs = async (nfts) => {
  // indexTokensFromWallet(nfts);

  const nftIds = nfts.map((e) => e.nftId);
  const collectionIds = nfts
    .map((e) => e.collectionInfo)
    .filter((e) => !_.isNil(e))
    .map((e) => e.collectionAddress ?? e.contractAddress)
    .map(parseCollectionId);

  const promises = nfts.map((e) => e.nftId).map(fetchTokenMetadata);
  const nftMetadatas = await Promise.all(
    promises.map(async (promise, index) => {
      try {
        const result = await Promise.race([
          promise,
          new Promise((resolve) => setTimeout(() => resolve(null), TIMEOUT_DELAY)),
        ]);

        if (result !== null) {
          return result;
        } else {
          return nfts[index]?.collectionInfo ?? nfts[index]?.metadata;
        }
      } catch (error) {
        return nfts[index]?.collectionInfo ?? nfts[index]?.metadata;
      }
    })
  );

  const collectionsFromMetadata = _.uniqWith(
    nftMetadatas
      .map((e) => e.collection_metadata ?? e.collectionAddress ?? e.contractAddress)
      .filter((e) => !_.isNil(e)),
    _.isEqual
  );
  const collectionUrls = collectionsFromMetadata.filter(isValidResource).map(ipfsToHttp);

  // dispatch resolution & caching of metadata
  await Promise.all(collectionUrls.map((url) => ({ collection_metadata: url })).map(fetchTokenCollectionMetadata));

  const gateIds = [...new Set([...nftIds, ...collectionIds, ...collectionsFromMetadata.map(parseCollectionId)])];
  return gateIds;
};

const isValidResource = (url) => {
  try {
    const pattern = /^(ipfs|http|https):\/\/[^ "]+$/;
    return pattern.test(url);
  } catch (error) {
    return false;
  }
};

export default AuthContextProvider;
