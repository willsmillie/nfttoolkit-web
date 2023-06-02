import { useContext } from 'react';
// @web3-react
import { AuthContext } from '../contexts/L2Context';

// ----------------------------------------------------------------------
export function useBalances() {
  return useContext(AuthContext);
}
