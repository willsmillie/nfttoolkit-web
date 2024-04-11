/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

// @mui
import { Box, Grid, Stack, Typography, Modal } from '@mui/material';

import { fetchTokenMetadata } from '../../hooks/useTokenResolver';
// components
// import GatedFilesList from '../files/GatedFilesList';
// import TokenInfo from './TokenInfo';
import TokenEmbed from './TokenEmbed';

// IPFS LIST
export default function TokenDetail({ nftId, metadata: partial_metadata, show, handleClose }) {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    function fetch() {
      if (!metadata && show) fetchTokenMetadata(nftId).then(setMetadata).catch(console.warn);
    }

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId, show]);

  const style = {
    position: 'absolute',
    top: '10%',
    left: '10%',
    transform: 'translate(-5%, -5%)',
    width: '90%',
    height: '90%',
    bgcolor: 'background.paper',
    borderRadius: '1%',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
  };

  const name = metadata?.name ?? partial_metadata?.name ?? '';

  return (
    <Modal
      open={show}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction="column" justifyContent="flex-start" alignItems="stretch" spacing={2}>
              <Typography
                level="h2"
                variant="h3"
                component="div"
                dangerouslySetInnerHTML={{ __html: name ?? 'NFT Title' }}
              />

              <TokenEmbed nftId={nftId} metadata={metadata ?? partial_metadata} open={show} />
              {/* <TokenInfo token={partial_metadata ?? metadata} /> */}
            </Stack>
          </Grid>
          {/* <Grid item xs={12} md={6} lg={6}>
            <Typography level="h2" variant="h3" component="div">
              Files & assets
            </Typography>
            <Typography variant="body2" component="div" color="text.secondary">
              Documents and attachments that have been uploaded as part of your current tokens.
            </Typography>
            <GatedFilesList gateId={nftId} />
          </Grid> */}
        </Grid>
      </Box>
    </Modal>
  );
}
