import { useState } from 'react';
import { Backdrop, Grid, Stack, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import { getDAGForCID } from '../utils/ipfs';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [cid, setCID] = useState('');
  const [results, setResults] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (cid.length === 0) return;

      setLoading(true);
      getDAGForCID(cid)
        .then(setResults)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
        });
    },
    [cid],
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
        <Typography variant="h4">Fetch the file tree for a pinned IPFS</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter an IPFS CID</p>

                  <TextField
                    label="IPFS CID"
                    id="outlined-size-small"
                    placeholder="Qm..."
                    size="small"
                    onChange={(e) => {
                      setCID(e.target.value);
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
                  <p>Results:</p>
                  <TextField
                    label="IPFS Results"
                    multiline
                    rows={15}
                    value={JSON.stringify(results, null, 2)}
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
  name: '🪐 IPFS Index',
  description: 'Inspect IPFS metadata data or file tree for tokens.',
  color: 'orange',
  content: Content,
};
