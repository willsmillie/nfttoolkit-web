import { useState } from 'react';
import { Backdrop, Grid, Stack, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import ConnectButton from '../components/ConnectButton';
import useDebounce from '../hooks/useDebounce';
import useLoopring from '../hooks/useLoopring';

const Content = () => {
  const { getHoldersForNFTData, getAccountsByIds, active } = useLoopring();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  // get holder by nft data
  const getHolders = async (nftData) => {
    // call Loopring API service to get the holding accounts
    const nftHolders = await getHoldersForNFTData(nftData);
    // prepare to resolve the accounts by mapping the id
    const accountIds = nftHolders.map((e) => e.accountId);

    // resolve the account objects to hex addresses
    const results = await getAccountsByIds(accountIds);
    setMetadata(results.map((e) => e.accInfo.owner));
    // return just the addresses
    // if (results?.length > 0) return results.map((e) => e.address);

    // return { status };
  };

  // DeBounce Function
  useDebounce(
    () => {
      if (id.length === 0) return;

      setLoading(true);
      getHolders(id)
        .then((r) => r?.data)
        .then(setMetadata)
        .finally(() => {
          setLoading(false);
        });
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
        <Typography variant="h4">Take a snapshot of a token's currents holders</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter an NFT Data</p>
                  {!active ? (
                    <ConnectButton />
                  ) : (
                    <>
                      <small>nftData can be retrieved in the 'My Tokens' or 'Token Look Up' tools.</small>
                      <TextField
                        label="nftData"
                        id="outlined-size-small"
                        placeholder="0x12345..."
                        size="small"
                        onChange={(e) => {
                          setId(e.target.value);
                        }}
                      />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Holder Addresses:</p>
                  <TextField
                    disabled
                    multiline
                    rows={15}
                    value={JSON.stringify(metadata, null, 2)}
                    id="outlined-size-small"
                    defaultValue="0x12345..."
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
  name: '🧩 Token Holders',
  description: 'Retrieve a list of holders of a given token for airdrops.',
  color: 'blue',
  content: Content,
};
