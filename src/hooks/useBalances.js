import { useContext } from 'react';
// @web3-react
import { AuthContext } from '../contexts/L2Context';

// ----------------------------------------------------------------------
export function useBalances() {
  const { balances } = useContext(AuthContext);
  return balances;
}
