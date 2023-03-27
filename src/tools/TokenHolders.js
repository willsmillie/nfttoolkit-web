import { useState } from 'react';
import {
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import { getHolders } from '../API';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);
      getHolders(id)
        .then((r) => r?.data)
        .then(setMetadata)
        .finally(() => {
          setLoading(false);
        });
    },
    [id],
    800
  );

  const StatusView = () => {
    switch (metadata?.status) {
      case 'ok' || 'success':
        return <Alert severity="success">Fetched</Alert>;
      case 'indexing':
        return <Alert severity="info">This token is queued for indexing, please check back later!</Alert>;
      case 'error':
        return <Alert severity="error">This is an error alert — check it out!</Alert>;
      default:
        return <></>;
    }
  };

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
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter an NFT Data</p>
                  <small>
                    The Loopring's NFT token data identifier which is a hash string of NFT token address and NFT_ID{' '}
                  </small>
                  <TextField
                    label="nftData"
                    id="outlined-size-small"
                    placeholder="0x12345..."
                    size="small"
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
                  <p>Metadata:</p>
                  <StatusView />
                  <TextField
                    label="Metadata"
                    disabled
                    multiline
                    rows={15}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    defaultValue="0x12345..."
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

export default { name: '🧩 Token Holders', description: 'Get holders of tokens', color: 'blue', content: Content };
