import { useState, useEffect } from 'react';
import { Grid, Stack, TextField, Card, Box, Typography, Select, Button } from '@mui/material';
import Label from '../components/Label';

const Content = () => {
  const [ids, setIds] = useState('');

  useEffect(() => {
    function fetch() {
      console.log('Fetching Id: ', ids);
    }

    return fetch();
  }, [ids]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ py: 10, px: 3 }}>
          {
            <Label color={'success'} sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}>
              {'Success'}
            </Label>
          }
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              columnGap: 2,
              rowGap: 3,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <p>Results:</p>
            <TextField
              label="nftId(s)"
              disabled
              multiline
              rows={4}
              id="outlined-size-small"
              placeholder=""
              size="small"
            />
          </Box>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">
              {'Save Changes'}
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

export default { name: '📦 Air Drop', description: 'Distribute tokens', color: 'green', content: Content };
