import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchTokenMetadata } from 'src/hooks/useTokenResolver';

const NftMetadataContext = createContext();

export const NftMetadataProvider = ({ children }) => {
  const [nftMetadata, setNftMetadata] = useState(new Map());

  const resolveMetadata = useCallback(
    async (nftList, updateEnrichedNfts) => {
      const nftIds = nftList.map((nft) => nft.nftId);
      const BATCH_SIZE = 20;
      const TIMEOUT = 5000; // 5 seconds timeout

      const fetchWithTimeout = (id) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Timeout')), TIMEOUT);
          fetchTokenMetadata(id)
            .then((data) => {
              clearTimeout(timer);
              resolve(data);
            })
            .catch((error) => {
              clearTimeout(timer);
              reject(error);
            });
        });

      const fetchMetadataBatch = async (batchIds) => {
        const results = await Promise.allSettled(batchIds.map(fetchWithTimeout));
        return results;
      };

      const newMetadata = new Map(nftMetadata);

      for (let i = 0; i < nftIds.length; i += BATCH_SIZE) {
        const batchIds = nftIds.slice(i, i + BATCH_SIZE);
        const results = await fetchMetadataBatch(batchIds);

        const enrichedList = [];
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            newMetadata.set(batchIds[index], result.value);
            enrichedList.push({ ...nftList[i + index], metadata: result.value });
          } else {
            enrichedList.push({ ...nftList[i + index], metadata: {} });
          }
        });

        setNftMetadata(new Map(newMetadata));
        updateEnrichedNfts((prevEnrichedNfts) => [...prevEnrichedNfts, ...enrichedList]);
      }

      return nftList.map((nft) => ({
        ...nft,
        metadata: newMetadata.get(nft.nftId) || {},
      }));
    },
    [nftMetadata]
  );

  const getMetadata = useCallback((nftId) => nftMetadata.get(nftId), [nftMetadata]);

  return <NftMetadataContext.Provider value={{ resolveMetadata, getMetadata }}>{children}</NftMetadataContext.Provider>;
};

export const useNftMetadata = () => useContext(NftMetadataContext);
