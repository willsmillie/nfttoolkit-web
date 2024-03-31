import { useState } from 'react';
import {
  Tab,
  Tabs,
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import useDebounce from '../hooks/useDebounce';

import stringToArray from '../utils/stringToArray';
import { resolveENS, resolveENSReverse } from '../utils/web3';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [results, setResults] = useState('');
  const [reverse, setReverse] = useState(0);

  // DeBounce Function
  useDebounce(
    () => {
      const reqs = [];
      if (account.length === 0) return;
      setLoading(true);
      stringToArray(account).forEach((acct) => {
        if (reverse) {
          reqs.push(resolveENSReverse(encodeURIComponent(acct)));
        } else {
          reqs.push(resolveENS(encodeURIComponent(acct)));
        }
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

      <Stack spacing={1}>
        <Typography variant="h4">Fetch associated address for ENS</Typography>
        <Grid container>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter a comma-delimited list of addresses (ens or hex)</p>

                  <Tabs value={reverse} onChange={(_, value) => setReverse(value)} aria-label="resolve-selector">
                    <Tab value={0} label="ENS to 0x" />
                    <Tab value={1} label="0x to ENS" />
                  </Tabs>
                  <TextField
                    label="ENS(s)"
                    id="outlined-size-small"
                    placeholder={
                      reverse
                        ? '0xb28e467158f4de5a652d308ae580b1733e3fb463'
                        : 'fenneckit.eth, wikk.loopring.eth, vitalik.eth'
                    }
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
