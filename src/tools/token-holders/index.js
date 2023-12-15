import { useState, useEffect } from 'react';
import {
  Tab,
  Tabs,
  CardHeader,
  Backdrop,
  Grid,
  Stack,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
} from '@mui/material';
import NFTSelect from 'src/components/NFTSelect';
import useLoopring from 'src/hooks/useLoopring';
import { getWhales } from 'src/API';
import { resolveENS, getAccountByAddress } from 'src/utils/web3';
import useDebounce from 'src/hooks/useDebounce';
import { getHoldersForNFTData } from './utils';
import Table from './table';
import WhalesTable from './whales-table';

const Content = () => {
  const { address: myAddress, getNFTData, authData, active, mints, nfts } = useLoopring();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [accountId, setAccountId] = useState(null);
  const [address, setAddress] = useState(myAddress);
  const [metadata, setMetadata] = useState('');

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  useEffect(() => {
    if (selectedTab === 0) {
      if (id?.length === 0) return;
      setLoading(true);
      const selectedTokenInfo =
        nfts?.find((e) => e.nftId.toLowerCase() === id.toLowerCase()) ??
        mints?.find((e) => e.nftId.toLowerCase() === id.toLowerCase());
      getNFTData(selectedTokenInfo).then(({ nftData }) =>
        getHoldersForNFTData(nftData, authData.apiKey)
          .then(setMetadata)
          .finally(() => {
            setLoading(false);
          })
      );
    } else {
      if (accountId?.length === 0) return;
      setLoading(true);
      getWhales(accountId)
        .then(setMetadata)
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accountId, selectedTab]);

  // DeBounce Function
  useDebounce(
    () => {
      if (address?.length === 0) return;
      resolveENS(address)
        .then(getAccountByAddress)
        .then((res) => {
          if (res?.accountId) {
            setAccountId(res.accountId);
          }
        });
    },
    [address],
    800
  );

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Stack spacing={1} padding={1}>
        <Typography variant="h4">Retrieve a list of holders by token or minter</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Fetch Holders By:" />
              <CardContent>
                <Stack spacing={2}>
                  <Tabs value={selectedTab} onChange={handleTabChange} aria-label="Holders Tab">
                    <Tab value={0} label="NFT" />
                    <Tab value={1} label="Minter" />
                  </Tabs>
                  {selectedTab === 0 ? (
                    <NFTSelect
                      active={active}
                      isLoading={loading}
                      rows={mints}
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                      }}
                    />
                  ) : (
                    <TextField value={address} onChange={(e) => setAddress(e.target.value)} label="Address" />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Holders" />
              <CardContent>
                {selectedTab === 0 ? <Table rows={metadata} /> : <WhalesTable rows={metadata} />}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default {
  name: '🧩 Token Holders',
  description: 'Retrieve a list of holders by token or minter for airdrops.',
  color: 'blue',
  content: Content,
};
