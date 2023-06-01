// @mui
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
// @web3-react
import { useWeb3React } from '@web3-react/core';
import { useBalances } from '../hooks/useBalances';
import ConnectButton from './ConnectButton';

export default function PageOne({ value, onChange }) {
  const { active } = useWeb3React();
  const { balances } = useBalances();

  const flattenedData = Object.values(
    balances.reduce((acc, currentItem) => {
      acc[currentItem.nftId] = currentItem;
      return acc;
    }, {})
  );

  return (
    <>
      {!active ? (
        <ConnectButton />
      ) : (
        <FormControl>
          <InputLabel id="nft-select-label">Select NFT</InputLabel>
          <Select labelId="nft-select" id="nft-select" value={value} label="Select NFT" onChange={onChange}>
            {(flattenedData ?? []).map((e) => (
              <MenuItem key={e.nftId} value={e.nftId}>
                {e.nftId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}
