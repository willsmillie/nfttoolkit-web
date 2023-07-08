import { useContext } from 'react';
// @web3-react
import { AuthContext } from '../contexts/L2Context';

// ----------------------------------------------------------------------
export default function useLoopring() {
  return useContext(AuthContext);
}
