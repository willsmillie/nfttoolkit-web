import { useState } from 'react';
import {
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import NFTSelect from '../components/NFTSelect';
import { useBalances } from '../hooks/useBalances';
import useIPFS from '../hooks/useIPFS';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  const { balances } = useBalances();
  const { fetchIPFS, ipfsNftIDToCid } = useIPFS();
  const tokenData = balances.find((e) => e.nftId === id);

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);

      const cid = ipfsNftIDToCid(id);
      fetchIPFS(cid)
        .then(setMetadata)
        .finally(() => {
          setLoading(false);
        });
    },
    [id],
    800
  );

  const StatusView = () => {
    switch (metadata?.status) {
      case 'ok' || 'success':
        return <Alert severity="success">Fetched</Alert>;
      case 'indexing':
        return <Alert severity="info">This item is queued for indexing, please check back in a moment!</Alert>;
      case 'error':
        return <Alert severity="error">This is an error alert — check it out!</Alert>;
      default:
        return <></>;
    }
  };

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
              <CardContent>
                <Stack spacing={2}>
                  <small>Retrieve the balances of an account.</small>
                  <NFTSelect
                    value={id}
                    onChange={(e) => {
                      setId(e.target.value);
                    }}
                  />
                  {/* <TextField
                    label="accountId"
                    id="outlined-size-small"
                    placeholder="12345"
                    size="small"
                    onChange={(e) => {
                      setId(e.target.value);
                    }}
                  /> */}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>IPFS Metadata:</p>
                  <StatusView />
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    defaultValue=""
                    size="small"
                  />
                  <p>Token Data:</p>
                  <TextField
                    label="Metadata"
                    multiline
                    rows={15}
                    value={JSON.stringify(tokenData, null, 2)}
                    id="outlined-size-small"
                    defaultValue=""
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
  name: '🗂️ My Tokens',
  description: 'Connect a wallet to view its holdings',
  color: 'orange',
  content: Content,
};
