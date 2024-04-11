// @mui
import { Typography, Stack, Grid } from '@mui/material';

import TokenCard from './TokenCard';
import useLoopring from '../../hooks/useLoopring';

// ----------------------------------------------------------------------

export default function TokenGrid({ rows }) {
  const { address } = useLoopring();
  return (
    <Stack padding={2}>
      {!address ? (
        <Typography variant="h5" align="center">
          Connect your wallet to view your assets!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {rows.map((token) => (
            <Grid item key={token?.nftId} xs={6} sm={4} md={3}>
              <TokenCard
                nftId={token?.nftId}
                metadata={{ ...token?.metadata?.base, ...token?.metadata?.extra, ...token?.metadata }}
                collectionMetadata={token?.collectionInfo}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
