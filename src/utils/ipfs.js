import axios from 'axios';
import * as Web3 from './web3';
// env vars
const { REACT_APP_INFURA_IPFS_API_KEY: INFURA_IPFS_API_KEY, REACT_APP_INFURA_IPFS_API_SECRET: INFURA_IPFS_API_SECRET } =
  process.env;

// Basic auth for headers sent to Infura IPFS API
const auth = `Basic ${Buffer.from(`${INFURA_IPFS_API_KEY}:${INFURA_IPFS_API_SECRET}`).toString('base64')}`;

// gateway to access ipfs files
const ipfsGateway = 'https://ipfs.io/ipfs/';

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

const getMetadataForCID = async (cid) => {
  // url containing the cid
  const url = `https://ipfs.infura.io:5001/api/v0/dag/get?arg=${cid}&encoding=json`;

  // Post request to the infura ipfs API
  const headers = { 'Content-Type': 'application/json', Authorization: auth, RequestMode: 'no-cors' };
  const request = fetch(url, { method: 'POST', headers, redirect: 'follow' });
  const response = await request.then((res) => res.json()).catch(console.error);
  console.log(JSON.stringify(response, null, null, 2));
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

  try {
    const response = await axios({
      method: 'POST',
      url,
      headers,
      responseType: 'arraybuffer', // Set the response type to 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    return buffer;
  } catch (error) {
    console.error('Error retrieving file:', error);
    return null;
  }
};

// Fetch the file graph
export const getDAGForCID = async (cid) => {
  try {
    // attempt to fetch a cached version
    const data = await getMetadataForCID(cid).catch(console.warn);
    if (data) return data;

    const buffer = await getBufferForCID(cid).catch(console.warn);
    return buffer;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const { ipfsNftIDToCid } = Web3;
