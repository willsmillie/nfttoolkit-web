import * as React from 'react';
import { Card, CardActionArea, Typography, CardContent, Chip, Stack } from '@mui/material';
import TokenDetail from './TokenDetail';
import { ipfsNftIDToCid, ipfsToHttp } from '../../utils/ipfs';
import Image from '../Image';

export default function TokenCard({ nftId, metadata, collectionMetadata, files }) {
  const [show, setShow] = React.useState(false);
  const imageSrc = ipfsToHttp(metadata?.image ?? metadata?.animation_url ?? ipfsNftIDToCid(nftId));
  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const typeCounts = files?.reduce((acc, ele) => {
    const { type } = ele;
    if (type) acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const types = Object.keys(typeCounts ?? {});
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

  return (
    <>
      <Card>
        <CardActionArea
          onClick={() => {
            setShow(true);
          }}
        >
          <Image
            sx={{ height: 300, minWidth: 200, backgroundColor: 'text.secondary' }}
            src={imageSrc}
            title="NFT image"
          />
          <CardContent>
            {metadata?.name && (
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                dangerouslySetInnerHTML={{ __html: metadata?.name ?? 'NFT Title' }}
              />
            )}
            {collectionMetadata?.name && (
              <Typography
                gutterBottom
                variant="body2"
                component="div"
                dangerouslySetInnerHTML={{ __html: collectionMetadata?.name ?? 'Collection' }}
              />
            )}
            {metadata?.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                }}
                dangerouslySetInnerHTML={{ __html: metadata?.description ?? 'NFT description' }}
              />
            )}
            <Stack direction="row" sx={{ py: 2 }} spacing={1}>
              {types &&
                types.map((type) => (
                  <Chip
                    key={type}
                    label={`${typeCounts[type]} ${capitalizeFirstLetter(type)}`}
                    color={colorForType(type)}
                  />
                ))}
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
      {nftId && metadata && collectionMetadata && (
        <TokenDetail
          {...{ nftId, metadata, collectionMetadata }}
          show={show}
          handleClose={() => {
            setShow(false);
          }}
        />
      )}
    </>
  );
}
