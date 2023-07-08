import { useState } from 'react';
import { Backdrop, Grid, Stack, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import { getThreads } from '../API';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [results, setResults] = useState('');

  // DeBounce Function
  useDebounce(
    () => {
      if (input.length === 0) return;

      setLoading(true);
      getThreads(input)
        .then((r) => r?.data)
        .then(setResults)
        .finally(() => {
          setLoading(false);
        });
    },
    [input],
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
        <Typography variant="h4">Get commented ENS / addresses from a twitter or reddit thread.</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter the URL of a Reddit or Twitter thread.</p>
                  <TextField
                    label="url"
                    id="outlined-size-small"
                    placeholder="https://www.reddit.com/r/Superstonk/comments/10n191q/giveaway_fresh_mint_of_my_bands_interactive_ep/"
                    size="small"
                    onChange={(e) => {
                      setInput(e.target.value);
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
                    label="Metadata"
                    disabled
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
  name: '🌾 Thread Ripper',
  description: 'Get Addresses / ENS from a reddit or twitter post.',
  color: 'blue',
  content: Content,
};
