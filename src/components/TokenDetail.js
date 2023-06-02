/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

// @mui
import { Box, Grid, Stack, Typography, Modal } from '@mui/material';

import Ratio from 'react-ratio';

// components
import FileList from './FileList';
import TokenInfo from './TokenInfo';
import useIPFS from '../hooks/useIPFS';

// IPFS LIST
export default function TokenDetail({ token, show, handleClose }) {
  const { fetchIPFS, ipfsNftIDToCid } = useIPFS();
  const [nftMetadata, setNFTMetadata] = useState(null);
  const name = nftMetadata?.name ?? '';
  const nftId = token?.nftId;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nftMetadata && !loading) {
      setLoading(true);
      const cid = ipfsNftIDToCid(nftId);
      if (!nftMetadata && cid?.length > 0) {
        fetchIPFS(cid)
          .then((data) => {
            setNFTMetadata(data);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  return (
    <Modal
      open={show}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <Stack
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
              spacing={2}
              sx={{ height: '50%' }}
            >
              <Typography level="h2" variant="h3" component="div">
                {name ?? 'Token Name'}
              </Typography>

              <TokenEmbed token={nftMetadata} open={show} />

              <TokenInfo token={nftMetadata} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Typography level="h2" variant="h3" component="div">
              Files & assets
            </Typography>
            <Typography variant="body2" component="div" color="text.secondary">
              Documents and attachments that have been uploaded as part of your current tokens.
            </Typography>
            {/* <IPFSTree cid={token?.animation_url ?? token?.image ?? ''} /> */}
            <FileList
              nftId={token?.nftId}
              cid={nftMetadata?.animation_url ?? nftMetadata?.image}
              minter={token?.minter}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

const TokenEmbed = ({ token, open }) => {
  const { ipfsToHttp, getDAGForCID } = useIPFS();
  const { image, name, animation_url } = token;
  const imageSrc = ipfsToHttp(animation_url ?? image ?? '');

  const [isDAG, setIsDAG] = useState(null);

  useEffect(() => {
    function fetch() {
      if (token && isDAG === null && open)
        getDAGForCID(token?.animation_url, token?.image)
          .then((dag) => {
            setIsDAG(dag.length > 0);
          })
          .catch(() => {
            setIsDAG(false);
          });
    }

    fetch();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, open]);

  const content = () =>
    isDAG ? (
      <embed
        alt={name ?? ''}
        title={name ?? ''}
        style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF00' }}
        src={imageSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    ) : (
      <video width="100%" height="auto" controls>
        <source src={imageSrc} type="video/mp4" />
      </video>
    );

  return (
    <Ratio ratio={1} justifyContent="center" alignItems="stretch" spacing={0}>
      {content()}
    </Ratio>
  );
};
