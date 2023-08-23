import { useState } from 'react';
import {
  Backdrop,
  Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
} from '@mui/material';
import ConnectButton from 'src/components/ConnectButton';
import useDebounce from 'src/hooks/useDebounce';
import useLoopring from 'src/hooks/useLoopring';
import { resolveENS, getAccountByAddress } from 'src/utils/web3';
import Table from './table';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState('');
  const [resolvedAccountId, setResolvedAccountId] = useState('');
  const { useBalances, active } = useLoopring();

  const { data: balances, isLoading: balancesIsLoading } = useBalances(resolvedAccountId);
  // DeBounce Function
  useDebounce(
    () => {
      if (account.length === 0) return;

      setLoading(true);
      resolveENS(account)
        .then(getAccountByAddress)
        .then((r) => setResolvedAccountId(r?.accInfo?.accountId))
        .finally(() => {
          setLoading(false);
        });
    },
    [account],
    800
  );

  return (
    <>
      {(loading || balancesIsLoading) && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      <Stack spacing={1} padding={1}>
        <Typography variant="h4">Fetch the contents of a wallet</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <p>Enter an ENS/Wallet Address</p>

                  {!active ? (
                    <ConnectButton />
                  ) : (
                    <TextField
                      label="ENS / 0x Address"
                      id="outlined-size-small"
                      placeholder="fenneckit.eth"
                      size="small"
                      rows={3}
                      onChange={(e) => {
                        setAccount(e.target.value);
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Holdings" />
              <CardContent>
                <Table rows={balances} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default {
  name: '🪪 Wallet Look Up',
  description: 'Enter a wallet address to view their current holdings.',
  color: 'green',
  content: Content,
};
