import dotenv from "dotenv";
import NFTs from "./nfts.js";
import ACCOUNTS from "./accounts.js";
import IPFS from "./ipfs.js";
import FILES from "./files.js";
import Runner from "./runner/index.js";
import ThreadRipper from './thread-ripper.js';

dotenv.config();

// NFTs API Endpoints
export const nfts = NFTs;
// ENS API Endpoints
export const accounts = ACCOUNTS;

// IPFS API Endpoints
export const ipfs = IPFS;

// IPFS API Endpoints
export const files = FILES;

// Task queue runs every minute
export const runner = Runner;

export const threadRipper = ThreadRipper;
