import React, { createContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { RateLimit as ratelimit } from 'async-sema';
import { useAccount } from 'wagmi';
import { getFilesForGates, parseGatesFromNFTs } from 'src/utils/tokenGate';
import { useUnlockContext } from 'src/contexts/unlock-context';

import { userAPI } from '../utils/web3';
import * as API from '../API';

export const AuthContext = createContext();
const rateLimiter = ratelimit(5);

const AuthContextProvider = (props) => {
  // const { activate, deactivate, library, account, active } = useWeb3React();
  const { address } = useAccount();
  const { data: authData } = useUnlockContext();
  const { accountId, apiKey } = authData ?? {};

  const [mints, setMints] = useState([]);
  const [nfts, setNFTs] = useState([]);

  const [gateIds, setGateIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);

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

  // fetch account data after authenticating
  useEffect(() => {
    function fetchData() {
      if (accountId?.length === 0 || !accountId) return;

      getAllNFTs(accountId)
        .then((results) => {
          setNFTs(results);
          parseGatesFromNFTs(results).then(setGateIds);
        })
        .catch(console.error);

      API.getMints(accountId).then(setMints);

      userAPI
        .getUserOwenCollection(
          {
            owner: address,
            isMintable: true,
          },
          apiKey
        )
        .then(({ collections: data }) => {
          setCollections(data);
        });

      // get the users gated files
      API.getFiles(accountId).then(setFiles).catch(console.error);
    }

    fetchData();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData]);

  useEffect(() => getFilesForGates(gateIds).then(setFiles), [gateIds]);

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
        apiKey,
        active: !!address && !!apiKey,
        address: address?.toLowerCase(),
        accountId,
        mints,
        nfts,
        useBalances,
        getNFTData,
        getTokenInfo,
        fetchMints,
        fetchNFTs,
        collections,
        files,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
