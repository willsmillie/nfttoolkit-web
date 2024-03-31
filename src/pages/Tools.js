// @mui
import { Container, Typography, Grid } from '@mui/material';
// components
import Page from '../components/Page';
import ToolCard from '../components/ToolModal';
import Tools from '../tools';

// ----------------------------------------------------------------------

export default function PageOne() {
  return (
    <Page title="Tools">
      <Container>
        <Typography variant="h3" component="h1" paragraph>
          🧰 NFT Tool Kit
        </Typography>
        <Typography gutterBottom>NFT Tool Kit provides essential utilities for interacting with Loopring </Typography>

        <Grid container justifyContent="space-evenly" alignItems="stretch" spacing={2}>
          {Tools.map((p) => (
            <ToolCard key={p.name} sx={{ flex: 'grow' }} tool={p} />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
