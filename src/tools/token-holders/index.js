import { useState, useEffect } from 'react';
import { CardHeader, Backdrop, Grid, Stack, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import NFTSelect from 'src/components/NFTSelect';
import useLoopring from 'src/hooks/useLoopring';
import { getHoldersForNFTData } from './utils';
import Table from './table';

const Content = () => {
  const { getNFTData, authData, active, mints } = useLoopring();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  useEffect(() => {
    if (id.length > 0) {
      const selectedTokenInfo = mints?.find((e) => e.nftId.toLowerCase() === id.toLowerCase());
      getNFTData(selectedTokenInfo).then(({ nftData }) =>
        getHoldersForNFTData(nftData, authData.apiKey)
          .then(setMetadata)
          .finally(() => {
            setLoading(false);
          })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Stack spacing={1} padding={1}>
        <Typography variant="h4">Take a snapshot of a token's currents holders</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Select NFT" />
              <CardContent>
                <Stack spacing={2}>
                  <NFTSelect
                    active={active}
                    isLoading={loading}
                    rows={mints}
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
              <CardHeader title="Holders" />
              <CardContent>
                <Table rows={metadata} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default {
  name: '🧩 Token Holders',
  description: 'Retrieve a list of holders of a given token for airdrops.',
  color: 'blue',
  content: Content,
};
