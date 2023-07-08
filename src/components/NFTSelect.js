// @mui
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
// @web3-react
import ConnectButton from './ConnectButton';

function TokenMenuItem({ nft }) {
  const name = nft.metadata?.base?.name?.length > 0 ? nft.metadata?.base?.name : nft.nftId;
  return <p>{name}</p>;
}

export default function TokenSelect({ active, isLoading, rows, value, onChange }) {
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {!active ? (
        <ConnectButton />
      ) : (
        <FormControl>
          <InputLabel id="nft-select-label">Select NFT</InputLabel>
          <Select labelId="nft-select" id="nft-select" value={value} label="Select NFT" onChange={onChange}>
            {(rows ?? []).map((nft) => (
              <MenuItem key={nft.nftId} value={nft.nftId}>
                <TokenMenuItem nft={nft} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}
