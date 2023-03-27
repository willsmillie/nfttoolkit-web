import { Stack, Typography, Button } from '@mui/material';
import BuyMeACoffee from '../components/BuyMeACoffee';

const Content = () => (
  <Stack spacing={1} padding={1}>
    <Typography variant="h3" component="h1" paragraph>
      Leave a tip?
    </Typography>
    <Typography gutterBottom>
      If you clicked here, thank you for even considering it! If you find NFT Tool Kit useful, and want to support
      further development (or help me and my dog eat) consider leaving a tip.
      <BuyMeACoffee sx={{ minWidth: '100px' }} />
    </Typography>

    <Stack direction="row" spacing={2}>
      <Button variant="contained" large>
        Fenneckit.eth
      </Button>
    </Stack>
  </Stack>
);

export default {
  name: '🥰 Donate',
  description: 'Consider leaving a tip if this site is helpful to you!',
  color: 'orange',
  content: Content,
};
