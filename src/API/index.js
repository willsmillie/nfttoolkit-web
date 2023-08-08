import axios from 'axios';

const dev = 'http://127.0.0.1:5001/nfttoolkit-ba61b/us-central1/api/';
const prod = 'https://us-central1-nfttoolkit-ba61b.cloudfunctions.net/api/';
const base = process.env.REACT_APP_DEVELOPMENT ? dev : prod;

// cors proxy for GSMP collection reqs
export const proxyUrl = `${base}proxy/`;

// Get tokens of a specific account
export const getDerivedCollections = async (accountId) => {
  console.log('get collections derived from NFTs for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `account/${accountId}/collectionsFromNFTs`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get tokens of a specific account
export const getNFTs = async (accountId) => {
  console.log('get NFTs for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `account/${accountId}/nfts`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get token gated files for a specific account
export const getFiles = async (accountId) => {
  console.log('get files for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `files/account/${accountId}`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get token gated files for a specific account
export const getFilesForGate = async (gateId) => {
  console.log('get files for gateId: ', gateId);
  if (!gateId) return [];
  const endpoint = `files/gate/${gateId}`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get mints of a specific account
export const getMints = async (accountId) => {
  console.log('get mints for accountId: ', accountId);
  if (!accountId) return [];
  const endpoint = `account/${accountId}/mintedNfts`; // Replace with your actual endpoint URL
  const url = `${base}${endpoint}`;
  const response = await axios.get(url);
  return response.data;
};

// Get holdings of a specific account
export const getThreads = (data) => {
  console.log('get threads for url: ', data);
  const endpoint = 'threadRipper-get';
  const params = `url=${data}`;
  const url = `${base}${endpoint}?${params}`;
  return axios.get(url);
};

// post redpacket reveal
export const postRedPacketReveal = (imageFile) => {
  const endpoint = 'redpacketreveal';
  const url = `${base}${endpoint}`;

  // Log the image file information for debugging purposes
  console.log('Image file:', imageFile);

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
