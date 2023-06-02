import { useState } from 'react';
import { Grid, Stack, Card, CardContent } from '@mui/material';
import useDebounce from '../hooks/useDebounce';
import NFTSelect from '../components/NFTSelect';
import FileList from '../components/FileList';
import { useBalances } from '../hooks/useBalances';
import useIPFS from '../hooks/useIPFS';

const Content = () => {
  const [setLoading] = useState(false);
  const [id, setId] = useState('');
  const [metadata, setMetadata] = useState('');

  const { balances } = useBalances();
  const { fetchIPFS, ipfsNftIDToCid } = useIPFS();
  const tokenData = balances.find((e) => e.nftId.toLowerCase() === id.toLowerCase());

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

  return (
    <Grid container margin={2} spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <p>Interact with token gated content.</p>
              <NFTSelect
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
              <p>Results:</p>
              {id && (
                <FileList nftId={id} minter={tokenData?.minter} cid={metadata?.animation_url ?? metadata?.image} />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default {
  name: '🎟️ Token Gate',
  description: 'Interact with token gated content.',
  color: 'blue',
  content: Content,
};
