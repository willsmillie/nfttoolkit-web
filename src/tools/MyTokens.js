import { useState } from 'react';
import { Backdrop, Grid, Stack, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import NFTSelect from '../components/NFTSelect';
import useLoopring from '../hooks/useLoopring';

const Content = () => {
  const { active, nfts, getNFTData } = useLoopring();

  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');
  const [tokenData, setTokenData] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);

      const selectedTokenInfo = nfts?.find((e) => e.nftId.toLowerCase() === id.toLowerCase());
      console.log('selected: ', selectedTokenInfo);
      if (selectedTokenInfo) {
        getNFTData(selectedTokenInfo).then(setTokenData);
        setMetadata(selectedTokenInfo);
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

      <Stack spacing={1} padding={1}>
        <Typography variant="h4">View the current holdings of an account</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <small>Retrieve the balances of an account.</small>
                  <NFTSelect
                    active={active}
                    isLoading={loading}
                    rows={nfts}
                    value={id}
                    onChange={(e) => {
                      setId(e.target.value);
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>IPFS Metadata:</p>
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    size="small"
                  />
                  <p>Token Data:</p>
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(tokenData, null, 2)}
                    id="outlined-size-small"
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
  name: '🗂️ My Tokens',
  description: 'Connect your wallet to view metadata for your current tokens.',
  color: 'orange',
  content: Content,
};
