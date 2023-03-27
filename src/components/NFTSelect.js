// @mui
import { Select, MenuItem } from '@mui/material';
// @web3-react
import { useWeb3React } from '@web3-react/core';
import { useBalances } from '../hooks/useBalances';
import ConnectButton from './ConnectButton';

export default function PageOne({ value, onChange }) {
  const { active } = useWeb3React();
  const balances = useBalances();

  const tokens = Object.values(balances ?? {});

  return (
    <>
      {!active ? (
        <ConnectButton />
      ) : (
        <Select labelId="nft-select" id="nft-select" value={value} label="Select NFT" onChange={onChange}>
          {(tokens ?? []).map((e) => (
            <MenuItem key={e.nftId} value={e.nftId}>
              {e.nftId}
            </MenuItem>
          ))}
        </Select>
      )}
    </>
  );
}
