import axios from 'axios';

const dev = 'http://127.0.0.1:5001/nfttoolkit-ba61b/us-central1/';
const prod = 'https://us-central1-nfttoolkit-ba61b.cloudfunctions.net/';
const forceProd = true;
const base = process.env.REACT_APP_DEVELOPMENT && !forceProd ? dev : prod;

const loopringBase =
  process.env.REACT_APP_DEVELOPMENT && !forceProd
    ? `https://uat2.loopring.io/api/v3`
    : `https://api3.loopring.io/api/v3`;
console.log(process.env.REACT_APP_DEVELOPMENT && !forceProd);
// cors proxy for GSMP collection reqs
export const proxyUrl = `${base}api/proxy/`;

// Get tokens of a specific account
export const getDerivedCollections = async (accountId) => {
  console.log('get collections derived from NFTs for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `api/account/${accountId}/collectionsFromNFTs`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get tokens of a specific account
export const getNFTs = async (accountId) => {
  console.log('get NFTs for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `api/account/${accountId}/nfts`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get token gated files for a specific account
export const getFiles = async (accountId) => {
  console.log('get files for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `api/files/account/${accountId}`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get token gated files for a specific account
export const getFilesForGate = async (gateId) => {
  console.log('get files for gateId: ', gateId);
  if (!gateId) return [];
  const endpoint = `api/files/gate/${gateId}`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get mints of a specific account
export const getMints = async (accountId) => {
  console.log('get mints for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `api/account/${accountId}/mintedNfts`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get holdings of a specific account
export const getThreads = (data) => {
  console.log('get threads for url: ', data);
  const endpoint = 'api/threadRipper-get';
  const params = `url=${data}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// post redpacket reveal
export const postRedPacketReveal = (imageFile) => {
  const endpoint = 'redpacketreveal';
  const url = `${base}${endpoint}`;

  // Create a FormData object and append the image file to it
  const formData = new FormData();
  formData.append('image', imageFile);

  // Make a POST request with the FormData object as the request body
  return axios.post(url, formData, {
    responseType: 'blob', // important
    headers: {
      enctype: 'multipart/form-data',
      'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
    },
  });
};

// Get biggest holders for a specific account
export const getWhales = async (accountId) => {
  console.log('get whales for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `api/account/${accountId}/whales`;
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get Account ID for an address
export const getAccountId = async (address) => {
  console.log('get account for address: ', address);
  if (!address || address?.length === 0) return [];
  const endpoint = `account?owner=${address}`;
  const url = `${loopringBase}/${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get Account ID for an address
export const isActivationRequired = async (address) => {
  console.log('get account for address: ', address);
  if (!address || address?.length === 0) return [];
  const endpoint = `api/v3/account?owner=${address}`;
  const url = `${loopringBase}/${endpoint}`;
  const response = await axios.get(url);
  return response.data?.code === 101002;
};
