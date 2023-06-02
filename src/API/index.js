import axios from 'axios';

const dev = 'http://127.0.0.1:5001/nfttoolkit-ba61b/us-central1/';
const prod = 'https://us-central1-nfttoolkit-ba61b.cloudfunctions.net/';
const base = process.env.REACT_APP_DEVELOPMENT ? dev : prod;

// Get NFT Metadata by NFT ID
export const getNFT = (nftId) => {
  const endpoint = 'nfts-get';
  const params = `nftId=${nftId}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get an address from an ens
export const getAccount = (account) => {
  const endpoint = 'accounts-get';
  const params = `account=${account}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get the ipfs data associated with a CID
export const getCID = (cid) => {
  const endpoint = 'ipfs-get';
  const params = `cid=${cid}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url).then((r) => r.data);
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
  const params = `account=${accountId}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// Get holdings of a specific account
export const getThreads = (data) => {
  const endpoint = 'threadRipper-get';
  const params = `url=${data}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};
