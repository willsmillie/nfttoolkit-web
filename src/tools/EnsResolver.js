import { useState } from 'react';
import { Backdrop, Grid, Stack, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import useDebounce from '../hooks/useDebounce';

import stringToArray from '../utils/stringToArray';
import { resolveENS } from '../utils/web3';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [results, setResults] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      const reqs = [];
      if (account.length === 0) return;
      setLoading(true);
      stringToArray(account).forEach((acct) => {
        reqs.push(resolveENS(encodeURIComponent(acct)));
      });

      Promise.all(reqs)
        .then(setResults)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
        });
    },
    [account],
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
  description: "Resolve a list of ENS' to their respective 0x address.",
  color: 'blue',
  content: Content,
};
