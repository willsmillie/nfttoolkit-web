import { useState } from 'react';
// @mui
import { Container, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import ToolCard from '../components/ToolModal';
import Tools from '../tools';

// ----------------------------------------------------------------------

export default function PageOne() {
  const { themeStretch } = useSettings();
  const [showTool, setShowTool] = useState(null);

  return (
    <Page title="Tools">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Tools
        </Typography>
        <Typography gutterBottom>NFT Tool Kit provides essential utilities for interacting with Looping </Typography>

        <Grid container justifyContent="space-evenly" alignItems="stretch" spacing={2}>
          {Tools.map((p) => (
            <ToolCard
              sx={{ flex: 'grow' }}
              tool={p}
              onClick={(tool) => {
                setShowTool(tool);
              }}
            />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
