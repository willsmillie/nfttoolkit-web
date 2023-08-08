import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
// @mui
import { Backdrop, CircularProgress, Container, Typography, Grid, Stack, Paper } from '@mui/material';
// components
import { postRedPacketReveal } from '../../API'; // Import the postRedPacketReveal function

import Preview from './preview';
import Design from './design';

// initial configuration (and what we reset to)
const defaultConfig = {
  image: null,
  download: null,
};

function Content() {
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
      <Typography variant="h4"> Animated red packet </Typography>
      <Typography variant="body"> Prevent bot scans of Red Packets by temporarily obscuring the QR code.</Typography>
      <Grid container spacing={2} marginTop={3}>
        {/* Preview */}
        <Grid item xs={6} md={8}>
          <Preview config={config} onChangeConfig={handleChangeConfig} />
        </Grid>

        {/* Layers */}
        <Grid item xs={6} md={4}>
          {/* nft layers manager */}
          <Controls config={config} onChangeConfig={handleChangeConfig} canReset={canReset} onReset={handleReset} />
        </Grid>
      </Grid>
    </Container>
  );
}

function Controls({ config, onChangeConfig, canReset, onReset }) {
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    // Call the postRedPacketReveal function with the selected image file
    postRedPacketReveal(config.image)
      .then((response) => {
        if (response.status === 200) {
          const url = URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'result.gif'; // Set the desired filename for the download
          link.click();
          URL.revokeObjectURL(url);
        } else {
          // Handle error response (status code other than 200)
          console.error('Failed to download the image. Status:', response.status);
        }
        setLoading(false);
      })
      .catch((error) => {
        // Handle errors here
        console.error('Error:', error);
        setLoading(false);
      });
  };

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Stack component={Paper} variant="outlined" spacing={2} sx={{ p: 3, borderRadius: 2 }}>
        <Design {...{ config, onChangeConfig, canReset, onReset, handleNext }} />
      </Stack>
    </>
  );
}

export default {
  name: '🧧 Red Packet Reveal',
  description: 'Prevent bot scans of Red Packets by temporarily obscuring the QR code.',
  color: 'blue',
  label: 'New',
  content: Content,
};
