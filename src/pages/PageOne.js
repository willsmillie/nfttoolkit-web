// @mui
import { Container, Typography, Grid } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import ToolCard from '../components/ToolModal';
import Tools from '../tools';

// ----------------------------------------------------------------------

export default function PageOne() {
  const { themeStretch } = useSettings();

  return (
    <Page title="Tools">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Tools
        </Typography>
        <Typography gutterBottom>NFT Tool Kit provides essential utilities for interacting with Looping </Typography>

        <Grid container justifyContent="space-evenly" alignItems="stretch" spacing={2}>
          {Tools.map((p) => (
            <ToolCard key={p.name} sx={{ flex: 'grow' }} tool={p} />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
