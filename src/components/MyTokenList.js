import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import {
  Card,
  CardHeader,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Grid,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { NFTAPI } from '@loopring-web/loopring-sdk/';
import { useWeb3React } from '@web3-react/core';

// components
import Image from './Image';

import TokenCard from './TokenCard';
import { useBalances } from '../hooks/useBalances';

// ----------------------------------------------------------------------

AppMyTokens.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  // list: PropTypes.array.isRequired,
};

export default function AppMyTokens({ title, subheader, ...other }) {
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

// ----------------------------------------------------------------------

TokenItem.propTypes = {
  country: PropTypes.shape({
    android: PropTypes.number,
    flag: PropTypes.string,
    name: PropTypes.string,
    windows: PropTypes.number,
  }),
};

function TokenItem({ token }) {
  const navigate = useNavigate();

  return (
    <ListItemButton
      onClick={() => {
        navigate(`/token/${token.nftId}`);
      }}
    >
      <ListItemIcon>
        <Image
          disabledEffect
          alt={token.name}
          src={`https://ipfs.loopring.io/ipfs/${(token?.image ?? '').replace('ipfs://', '')}`}
          sx={{ width: 28, mr: 1 }}
        />
      </ListItemIcon>
      <Stack>
        <ListItemText primary={token.name} />
        <ListItemText secondary={token.nftId} />
      </Stack>
    </ListItemButton>
  );
}
