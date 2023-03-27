import dotenv from 'dotenv';
import NFTs from './nfts.js';
import ENS from './ens.js';
import IPFS from './ipfs.js';
import FILES from './files.js';
import DOWNLOAD from './download.js';
import Runner from './runner/index.js';

dotenv.config();

// NFTs API Endpoints
export const nfts = NFTs;
// ENS API Endpoints
export const ens = ENS;

// IPFS API Endpoints
export const ipfs = IPFS;

// IPFS API Endpoints
export const files = FILES;

// Downloads API Endpoints
export const download = DOWNLOAD;

// Task queue runs every minute
export const runner = Runner;
