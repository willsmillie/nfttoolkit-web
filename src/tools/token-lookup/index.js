import { useState } from 'react';
import {
  Tab,
  Tabs,
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import useDebounce from 'src/hooks/useDebounce';
import NFTSelect from 'src/components/NFTSelect';
import useLoopring from 'src/hooks/useLoopring';
import { metadataForNFTId } from 'src/utils/ipfs';

const Content = () => {
  const { active, nfts, mints, getNFTData } = useLoopring();

  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');
  const [tokenData, setTokenData] = useState('');

  const [selectedTab, setSelectedTab] = useState(0);

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);

      const selectedTokenInfo =
        nfts?.find((e) => e.nftId.toLowerCase() === id.toLowerCase()) ??
        mints?.find((e) => e.nftId.toLowerCase() === id.toLowerCase());

      if (selectedTokenInfo) {
        getNFTData(selectedTokenInfo).then((res) => {
          setTokenData(res);
          metadataForNFTId(id).then(setMetadata);
        });
      } else {
        setTokenData('');
      }

      setLoading(false);
    },
    [id],
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
        <Typography variant="h4">View the current holdings of an account</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Fetch Token By:" />
              <CardContent>
                <Stack spacing={2}>
                  <Tabs value={selectedTab} onChange={(e, value) => setSelectedTab(value)} aria-label="lookup-by">
                    <Tab label="Owned" value={0} />
                    <Tab label="Minted" value={1} />
                  </Tabs>
                  <NFTSelect
                    active={active}
                    isLoading={loading}
                    rows={selectedTab === 0 ? nfts : mints}
                    value={id}
                    onChange={(e) => {
                      setId(e.target.value);
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>IPFS Metadata:</p>
                  <TextField
                    label="Metadata"
                    multiline
                    rows={30}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    size="small"
                  />
                  <p>Token Data:</p>
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(tokenData, null, 2)}
                    id="outlined-size-small"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default {
  name: '🗂️ Token Look Up',
  description: 'Retrieve token metadata from IPFS via owned, minted, or nftId.',
  color: 'orange',
  content: Content,
};
