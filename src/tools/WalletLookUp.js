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
import ConnectButton from '../components/ConnectButton';
import useDebounce from '../hooks/useDebounce';
import { useBalances } from '../hooks/useBalances';
import { resolveENS } from '../utils/web3';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [metadata, setMetadata] = useState('');
  const { authData, getAccountByAddress, getBalances, active } = useBalances();

  const [filters, setFilters] = useState({ minter: '0xb28e467158f4de5a652d308ae580b1733e3fb463' });
  // DeBounce Function
  useDebounce(
    () => {
      if (account.length === 0) return;

      setLoading(true);
      resolveENS(account)
        .then(getAccountByAddress)
        .then((r) => getBalances({ apiKey: authData.apiKey, accountId: r?.accInfo?.accountId }) ?? [])
        .then((r) =>
          r?.flat().filter((ele) => {
            let result = false;
            Object.keys(filters).forEach((filter) => {
              console.log(ele[filter], filters[filter]);
              if (ele[filter].toLowerCase() === filters[filter].toLowerCase()) {
                result = true;
              }
            });

            return result;
          })
        )
        .then(setMetadata)
        .finally(() => {
          setLoading(false);
        });
    },
    [account],
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
        <Typography variant="h4">Fetch the contents of a wallet</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter an ENS/Wallet Address</p>

                  {!active ? (
                    <ConnectButton />
                  ) : (
                    <TextField
                      label="ENS / 0x Address"
                      id="outlined-size-small"
                      placeholder="fenneckit.eth"
                      size="small"
                      rows={3}
                      onChange={(e) => {
                        setAccount(e.target.value);
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Filters:</p>
                  {Object.keys(filters).map((filter) => `${filter}: ${filters[filter]}`)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Results:</p>
                  <StatusView />
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    defaultValue=""
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
  name: '🪪 Wallet Look Up',
  description: 'View the contents of a wallet',
  color: 'green',
  content: Content,
};
