import { useState, useEffect } from 'react';
import {
  Box,
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import { getNFT } from '../API';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);
      getNFT(id)
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
        <Typography variant="h4">Fetch associated metadata from IPFS</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter a comma-delimited list of NFT Ids</p>

                  <TextField
                    label="nftId(s)"
                    id="outlined-size-small"
                    placeholder="0x5fdda54fe162472b47b2a158580cf4bc782ea8d26478abf3c82491a7094f1baf"
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
                  <p>Holders:</p>
                  <StatusView />
                  <TextField
                    label="Metadata"
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

export default { name: '🔍 Token Look Up', description: 'Get token metadata', color: 'green', content: Content };
