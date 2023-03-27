import axios from 'axios';

const base = 'http://127.0.0.1:5001/fenneckitnft/us-central1/';

// Get NFT Metadata by NFT ID
export const getNFT = (nftId) => {
  const endpoint = 'nfts-get';
  const params = `nftId=${nftId}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get an address from an ens
export const getENS = (ens) => {
  const endpoint = 'ens-get';
  const params = `ens=${ens}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get the ipfs data associated with a CID
export const getCID = (cid) => {
  const endpoint = 'ipfs-get';
  const params = `cid=${cid}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get holders of a specific token
export const getHolders = (nftData) => {
  const endpoint = 'nfts-getHolders';
  const params = `nftData=${nftData}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get holdings of a specific account
export const getOwnedBy = (accountId) => {
  const endpoint = 'nfts-ownedBy';
  const params = `accountId=${accountId}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};
