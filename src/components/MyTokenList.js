// @mui
import { Typography, Stack, Grid, Container } from '@mui/material';

import TokenCard from './TokenCard';
import { useBalances } from '../hooks/useBalances';

// ----------------------------------------------------------------------

export default function MyTokens() {
  const { balances, active, account } = useBalances();
  const tokensHeldByUser = (balances ?? []).filter((e) => e.minter.toLowerCase() === account?.toLowerCase());
  const flattenedData = Object.values(
    tokensHeldByUser.reduce((acc, currentItem) => {
      acc[currentItem.nftId] = currentItem;
      return acc;
    }, {})
  );

  return (
    <Container>
      <Typography variant="h3" component="h1" paragraph>
        Assets
      </Typography>

      <Stack>
        {!active ? (
          <Typography variant="h5" align="center">
            Connect your wallet to view your assets!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {flattenedData.map((token) => (
              <Grid item key={token.nftId} xs={6} sm={4} md={3}>
                <TokenCard token={token} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
