import React, { createContext, useState, useEffect, useMemo } from 'react';

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
  const { address } = useAccount();
  const { data: authData } = useUnlockContext();
  const { accountId: accId, apiKey } = authData ?? {};

  const accountId = useMemo(() => {
    async function fetchData() {
      if (accId) return accId;
      if (address) {
        const res = await API.getAccountId(address);
        return String(res?.accountId);
      }
      return null;
    }

    fetchData();
  }, [address, accId]);

  const [mints, setMints] = useState([]);
  const [nfts, setNFTs] = useState([]);

  const [gateIds, setGateIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);

  // paginator for loopring API requests
  const loopringFetcher = async (url) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (response.ok) return response.json();

    throw new Error('Failed to fetch');
  };

  // fetch account data after authenticating
  useEffect(() => {
    async function fetchData() {
      const accId = accountId || (await API.getAccountId(address).then((r) => r.accountId));
      if (accId?.length === 0 || !accId) return;

      API.getNFTs(accId)
        .then((results) => {
          setNFTs(results);
          parseGatesFromNFTs(results)
            .then(setGateIds)
            .then((err) => console.error(err?.message ?? err));
        })
        .catch((err) => console.error(err?.message ?? err));

      API.getMints(accId).then(setMints);

      if (authData)
        userAPI.getUserOwenCollection({ owner: address, isMintable: true }, apiKey).then(({ collections: data }) => {
          setCollections(data);
        });

      // get the users gated files
      API.getFiles(accId).then(setFiles).catch(console.error);
    }

    fetchData();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, address]);

  useEffect(() => getFilesForGates(gateIds).then(setFiles), [gateIds]);

  // fetch held NFTs for a given accountId
  const fetchNFTs = async (accountId, page = 0, limit = 50) => {
    const response = await userAPI
      .getUserNFTBalances(
        {
          accountId,
          offset: page * limit,
          limit,
          metadata: true,
        },
        apiKey
      )
      .catch((e) => console.error(e));
    console.log('Fetched nfts', { response });
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
    const res = await loopringFetcher(url);
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

  // Fetch nfts, paginating Looprings REST API
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
        getAllNFTs,
        collections,
        files,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
