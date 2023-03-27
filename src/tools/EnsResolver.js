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
import { getAccount } from '../API';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [results, setResults] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (account.length === 0) return;

      setLoading(true);
      getAccount(encodeURIComponent(account))
        .then((r) => r?.data)
        .then(setResults)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
        });
    },
    [account],
    800
  );

  const StatusView = () => {
    switch (results?.status) {
      case 'ok' || 'success':
        return <Alert severity="success">Fetched</Alert>;
      case 'indexing':
        return <Alert severity="info">This ens is queued for indexing, please check back later!</Alert>;
      case 'error':
        return <Alert severity="error">There was an error!</Alert>;
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
        <Typography variant="h4">Fetch associated address for ENS</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter a comma-delimited list of addresses (ens or hex)</p>

                  <TextField
                    label="ENS(s)"
                    id="outlined-size-small"
                    placeholder="fenneckit.eth, wikk.loopring.eth, vitalik.eth"
                    size="small"
                    rows={3}
                    onChange={(e) => {
                      setAccount(e.target.value);
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
                  <p>Addresses:</p>
                  <StatusView />
                  <TextField
                    label="Address"
                    multiline
                    rows={15}
                    value={JSON.stringify(results, null, 2)}
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

export default {
  name: '👾 ENS Resolver',
  description: 'Get the address behind an ENS',
  color: 'blue',
  content: Content,
};
