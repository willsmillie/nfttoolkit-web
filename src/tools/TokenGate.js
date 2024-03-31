import { Typography, Grid, Stack, Card, CardContent } from '@mui/material';

import ConnectButton from '../components/ConnectButton';
import ManageFilesList from '../components/files/ManageFilesList';
import useLoopring from '../hooks/useLoopring';

const Content = () => {
  const { active, account } = useLoopring();

  return (
    <Grid container>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography>Token Gate</Typography>
              <p>Configure token-gated content for a collection or token.</p>
              {!active ? <ConnectButton /> : <ManageFilesList minter={account} />}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default {
  name: '🎟️ Token Gate',
  description: 'Configure token gated content for your tokens and/or collections.',
  color: 'blue',
  content: Content,
  // label: 'New',
};
