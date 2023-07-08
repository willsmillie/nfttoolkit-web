import { useEffect, useState } from 'react';
import { ipfsNftIDToCid, fetchIPFS } from '../utils/ipfs';

// const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

// parse the collection identifier from the url for loopring & gamestop respectively
export const parseCollectionId = (url) => {
  const gamestopRegex = /collectionId=([a-f0-9-]+)/;
  const loopringRegex = /\/([^/]+)$/;

  let match = url?.match(gamestopRegex);
  if (match) return match[1];

  match = url?.match(loopringRegex);
  if (match) return match[1];

  return url;
};

// Function to fetch token metadata
export const fetchTokenMetadata = async (nftId) => {
  const CID = ipfsNftIDToCid(nftId);

  // Check if metadata is available in cache
  const cachedMetadata = localStorage.getItem(`nft_metadata_${nftId}`);
  if (cachedMetadata) {
    return JSON.parse(cachedMetadata);
  }

  // Perform a request to fetch metadata
  try {
    const data = await fetchIPFS(CID);
    if (data) {
      // Cache the metadata in localStorage
      localStorage.setItem(`nft_metadata_${nftId}`, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
  }

  return null;
};

// Function to fetch token collection metadata
export const fetchTokenCollectionMetadata = async (metadata) => {
  if (metadata && metadata.collection_metadata) {
    const collectionId = parseCollectionId(metadata.collection_metadata);
    // Check if collection metadata is available in cache
    const cachedCollectionMetadata = localStorage.getItem(`collection_metadata_${collectionId}`);
    if (cachedCollectionMetadata) {
      return JSON.parse(cachedCollectionMetadata);
    }

    try {
      const response = await fetch(metadata.collection_metadata);
      if (response.ok) {
        const data = await response.json();
        // Cache the collection metadata in localStorage
        localStorage.setItem(`collection_metadata_${collectionId}`, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error('Error fetching collection metadata:', error);
    }
  }

  return null;
};

// resolve IPFS metadata from IPFS or local storage cache if it exists
export default function useTokenResolver(nftId) {
  const [metadata, setMetadata] = useState(null);
  const [collectionMetadata, setCollectionMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      const data = await fetchTokenMetadata(nftId);
      setMetadata(data);
      setLoading(false);
    };

    fetchMetadata();
  }, [nftId]);

  useEffect(() => {
    const fetchCollectionMetadata = async () => {
      const data = await fetchTokenCollectionMetadata(metadata);
      setCollectionMetadata(data);
    };

    fetchCollectionMetadata();
  }, [metadata]);

  return { metadata, collectionMetadata, loading };
}
