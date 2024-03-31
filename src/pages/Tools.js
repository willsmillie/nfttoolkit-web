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
        <Typography variant="h1" component="h1" paragraph>
          🧰 NFT Tool K.it
        </Typography>
        <Typography variant="h3" component="h2" fontWeight="light" paragraph>
          L2 Swiss Army Knife
        </Typography>
        <Typography variant="subtitle1" color="text.primary" gutterBottom>
          Essential utilities for interacting with Loopring.
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Select a tool to get started! Mint, find holders, token gate content, lookup tokens ens wallets and more!
        </Typography>

        <Grid container justifyContent="space-evenly" alignItems="stretch" spacing={2}>
          {Tools.map((p) => (
            <ToolCard key={p.name} sx={{ flex: 'grow' }} tool={p} />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
