import { useState, useEffect } from 'react';
import { Grid, Stack, TextField, Card, Box, Typography, Select, Button } from '@mui/material';
import Label from '../components/Label';
import BuyMeACoffee from '../components/BuyMeACoffee';

const Content = () => {
  const [ids, setIds] = useState('');

  useEffect(() => {
    function fetch() {
      console.log('Fetching Id: ', ids);
    }

    return fetch();
  }, [ids]);

  return (
    <Stack spacing={1} padding={1}>
      <Typography variant="h3" component="h1" paragraph>
        Leave a tip?
      </Typography>
      <Typography gutterBottom>
        If you clicked here, thank you for even considering it! If you find NFTToolK.it useful, and want to support
        further development (or help me and my dog eat).
      </Typography>

      <Stack direction="row" spacing={2}>
        <BuyMeACoffee />
        <Button variant="contained" large>
          Fenneckit.eth
        </Button>
      </Stack>
    </Stack>
  );
};

export default {
  name: '🥰 Donate',
  description: 'Consider leaving a tip if this site is helpful to you!',
  color: 'orange',
  content: Content,
};
