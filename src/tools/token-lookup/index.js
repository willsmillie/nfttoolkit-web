import { useState } from 'react';

import {
  Tab,
  Tabs,
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';

import useDebounce from 'src/hooks/useDebounce';
import NFTSelect from 'src/components/NFTSelect';
import useLoopring from 'src/hooks/useLoopring';
import { metadataForNFTId } from 'src/utils/ipfs';
import { useSnackbar } from 'src/components/snackbar';

const Content = () => {
  const { address, nfts, mints, getNFTData } = useLoopring();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');
  const [tokenData, setTokenData] = useState('');

  const [selectedTab, setSelectedTab] = useState(0);

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);

      const selectedTokenInfo =
        nfts?.find((e) => e.nftId.toLowerCase() === id.toLowerCase()) ??
        mints?.find((e) => e.nftId.toLowerCase() === id.toLowerCase());

      if (selectedTokenInfo) {
        getNFTData(selectedTokenInfo)
          .then((res) => {
            setTokenData(res);
            metadataForNFTId(id)
              .then(setMetadata)
              .catch((err) => {
                console.error(err.message);
                enqueueSnackbar(err.message ?? 'Failed to load metadata', { variant: 'error' });
              });
          })
          .catch((err) => {
            console.error(err.message);
            enqueueSnackbar(err.message, { variant: 'error' });
          });
      } else {
        setTokenData('');
      }

      setLoading(false);
    },
    [id],
    800
  );

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Stack spacing={1}>
        <Typography variant="h4">View the current holdings of an account</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Fetch Token By:" />
              <CardContent>
                <Stack spacing={2}>
                  <Tabs value={selectedTab} onChange={(e, value) => setSelectedTab(value)} aria-label="lookup-by">
                    <Tab label="Owned" value={0} />
                    <Tab label="Minted" value={1} />
                    {/* <Tab label="NFT ID" value={2} /> // !TODO: Add support for nftId */}
                  </Tabs>
                  {selectedTab !== 2 ? (
                    <NFTSelect
                      active={address}
                      isLoading={loading}
                      rows={selectedTab === 0 ? nfts : mints}
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                      }}
                    />
                  ) : (
                    <>
                      <TextField label="NFT ID" id="nft-id" size="small" />
                      <TextField label="Minter" id="minter" size="small" />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="IPFS Metadata"
                    multiline
                    rows={30}
                    value={JSON.stringify(metadata, null, 2)}
                    id="token-metadata-results"
                    size="small"
                  />
                  <TextField
                    label="Token Data"
                    multiline
                    rows={15}
                    value={JSON.stringify(tokenData, null, 2)}
                    id="token-metadata-results"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default {
  name: '🗂️ Token Look Up',
  description: 'Retrieve token metadata from IPFS via owned, minted, or nftId.',
  color: 'orange',
  content: Content,
};
