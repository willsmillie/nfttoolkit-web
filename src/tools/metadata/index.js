import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
// @mui
import { Container, Typography, Grid, Stack, Paper } from '@mui/material';
// components

import Preview from './preview';
import Design from './design';

// initial configuration (and what we reset to)
const defaultConfig = {
  name: null,
  description: null,
  animation_url: null,
  image: null,
  collection_metadata: null,
  royalty_percentage: null,
};

function MetadataView() {
  const [config, setConfig] = useState(defaultConfig);
  const canReset = !isEqual(defaultConfig, config);

  const handleChangeConfig = useCallback((name, value) => {
    setConfig((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  return (
    <Container>
      <Typography variant="h4"> Metadata </Typography>
      <Typography variant="body"> Configure token metadata for minting with IPFS.</Typography>
      <Grid container spacing={2} marginTop={3}>
        {/* Preview */}
        <Grid item xs={12} sm={6} md={6}>
          <Preview config={config} />
        </Grid>

        {/* Layers */}
        <Grid item xs={12} sm={6} md={6}>
          {/* nft layers manager */}
          <Controls config={config} onChangeConfig={handleChangeConfig} canReset={canReset} onReset={handleReset} />
        </Grid>
      </Grid>
    </Container>
  );
}

function Controls({ config, onChangeConfig, canReset, onReset }) {
  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', unloadCallback);
    return () => window.removeEventListener('beforeunload', unloadCallback);
  }, []);

  const handleNext = () => {
    const filename = 'metadata.json';
    const fileContent = JSON.stringify(config, null, 2); // Convert config object to string

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <Stack component={Paper} variant="outlined" spacing={2} sx={{ p: 3, borderRadius: 2 }}>
      <Design {...{ config, onChangeConfig, canReset, onReset, handleNext }} />
    </Stack>
  );
}

export default {
  name: '🪛 Metadata Tester',
  description: 'Configure & preview metadata for custom tokens.',
  color: 'green',
  // label: 'New',
  content: MetadataView,
};
