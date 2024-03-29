import axios from 'axios';

import * as Web3 from './web3';
// env vars
const { REACT_APP_INFURA_IPFS_API_KEY: INFURA_IPFS_API_KEY, REACT_APP_INFURA_IPFS_API_SECRET: INFURA_IPFS_API_SECRET } =
  process.env;

// Basic auth for headers sent to Infura IPFS API
const auth = `Basic ${Buffer.from(`${INFURA_IPFS_API_KEY}:${INFURA_IPFS_API_SECRET}`).toString('base64')}`;

// gateway to access ipfs files
const ipfsGateway = 'https://ipfs.loopring.io/ipfs/';

// remove the ipfs protocol prefix replacing with the gateway
export function ipfsToHttp(string) {
  if (string == null || string.length === 0 || !string.includes('ipfs://')) return string;
  return ipfsGateway + sanitizeCID(string);
}

// remove the ipfs protocol prefix
export const sanitizeCID = (newValue) => newValue.replace('ipfs://', '');

// attempt to fetch JSON text from a CID
export async function fetchIPFS(cid) {
  const ipfsSrc = ipfsGateway + cid;
  try {
    const data = await fetch(ipfsSrc)
      .then((res) => res.json())
      .catch(console.error);

    return data;
  } catch (error) {
    console.error('Error:', error);
    // Handle the error
    return error;
  }
}

const getDirectoriesForCID = async (cid) => {
  // url containing the cid
  const url = `https://ipfs.infura.io:5001/api/v0/dag/get?arg=${cid}&encoding=json`;

  // Post request to the infura ipfs API
  const headers = { 'Content-Type': 'application/json', Authorization: auth, RequestMode: 'no-cors' };
  const request = fetch(url, { method: 'POST', headers, redirect: 'follow' });
  const response = await request.then((res) => res.json()).catch(console.error);
  return parseLinks(response);
};

const parseLinks = (data) => {
  if (!data || data?.Data == null) return null;
  // verify the document is using a file-structure encoding (instead of base64 or something)
  if (data?.Data['/']?.bytes === 'CAE') {
    return Object.keys(data.Links).map((key) => {
      const link = data.Links[key];
      return { id: link.Hash['/'], name: link.Name, size: link.Tsize };
    });
  }
  return null;
};

const getBufferForCID = async (cid) => {
  const url = `https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: auth,
  };

  const response = await axios({
    method: 'POST',
    url,
    headers,
    responseType: 'arraybuffer', // Set the response type to 'arraybuffer'
  });

  if (!response.data) throw new Error('Missing data for buffer');

  const buffer = Buffer.from(response.data);
  return buffer;
};

// Fetch the file graph
export const getDAGForCID = async (cid) => {
  const data = await getDirectoriesForCID(cid);
  if (data) return data;

  const buffer = await getBufferForCID(cid).catch(console.warn);
  if (buffer) return buffer;

  throw new Error('Failed to retrieve IPFS CID');
};

export const metadataForNFTId = async (nftId) => fetchIPFS(ipfsNftIDToCid(nftId));

export const { ipfsNftIDToCid } = Web3;
