import { useState, useEffect } from 'react';
import { Typography, CardContent, CardMedia, Chip, Stack } from '@mui/material';
import useIPFS from '../hooks/useIPFS';

const IPFSView = ({ cid, collectionInfo, files }) => {
  const { fetchIPFS, ipfsToHttp } = useIPFS();
  const [nftMetadata, setNFTMetadata] = useState(null);
  const imageSrc = ipfsToHttp(nftMetadata?.image ?? nftMetadata?.animation_url ?? '');

  useEffect(() => {
    if (!nftMetadata && cid?.length > 0) {
      fetchIPFS(cid).then(setNFTMetadata);
    }
    return () => {};
  }, [cid]);

  const typeCounts = files?.reduce((acc, ele) => {
    const { type } = ele;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function colorForType(type) {
    switch (type) {
      case 'audio':
        return 'primary';
      case 'video':
        return 'secondary';
      default:
        return 'error'; // or handle other cases if needed
    }
  }

  // Example usage

  return (
    <>
      <CardMedia sx={{ height: 300 }} image={ipfsToHttp(imageSrc ?? '')} title="NFT image" />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {nftMetadata?.name ?? 'NFT Title'}
        </Typography>
        <Typography gutterBottom variant="body2" component="div">
          {collectionInfo?.name ?? 'Collection'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}
        >
          {nftMetadata?.description ?? 'NFT description'}
        </Typography>
        <Stack direction="row" sx={{ py: 2 }} spacing={1}>
          {Object.keys(typeCounts ?? {}).map((type) => (
            <Chip label={`${typeCounts[type]} ${capitalizeFirstLetter(type)}`} color={colorForType(type)} />
          ))}
        </Stack>
      </CardContent>
    </>
  );
};

export default IPFSView;
