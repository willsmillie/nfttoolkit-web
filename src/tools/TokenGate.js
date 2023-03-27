import { useState, useEffect } from 'react';
import { Grid, Stack, TextField } from '@mui/material';

const Content = () => {
  const [ids, setIds] = useState('');

  useEffect(() => {
    function fetch() {
      console.log('Fetching Id: ', ids);
    }

    return fetch();
  }, [ids]);

  return (
    <Grid container margin={2} spacing={2}>
      <Grid item xs={6}>
        <Stack spacing={2}>
          <p>🔍 Token Look Up</p>
          <TextField
            label="nftId(s)"
            id="outlined-size-small"
            defaultValue="0x12345..."
            size="small"
            onChange={(e) => {
              setIds(e.target.value);
            }}
          />
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2}>
          <p>Results:</p>
          <TextField
            label="nftId(s)"
            disabled
            multiline
            rows={4}
            id="outlined-size-small"
            defaultValue="0x12345..."
            size="small"
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default {
  name: '🎟️ Token Gate',
  description: 'Interact with token gated content.',
  color: 'blue',
  content: Content,
};
