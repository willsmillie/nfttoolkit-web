import { useContext } from 'react';
// @web3-react
import { AuthContext } from '../contexts/L2Context';
import { ipfsNftIDToCid } from '../utils/web3';
import { getDAGForCID } from '../utils/ipfs';

// ----------------------------------------------------------------------
export default function useIPFS() {
  const { ipfsData, fetchIPFS } = useContext(AuthContext);

  function ipfsToHttp(string) {
    return string.replace('ipfs://', 'https://nfttoolkit.infura-ipfs.io/ipfs/');
  }

  return { ipfsData, fetchIPFS, ipfsToHttp, ipfsNftIDToCid, getDAGForCID };
}
