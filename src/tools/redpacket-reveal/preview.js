import { alpha } from '@mui/material/styles';
import { Box, Typography, Stack, Paper } from '@mui/material';
import Ratio from 'react-ratio';
import Image from '../../components/Image';
import OverlayImg from './overlay.webp';

export default function Preview({ config }) {
  return (
    <Stack component={Paper} variant="outlined" spacing={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6">Preview</Typography>
      <Box
        sx={{
          width: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: config.color,
        }}
      >
        <GIFComposer image={config.image} />
      </Box>
    </Stack>
  );
}

const GIFComposer = ({ image, overlay = OverlayImg }) => (
  <Ratio ratio={1080 / 1920} sx={{ maxHeight: 300 }}>
    {image && <Image src={URL.createObjectURL(image)} sx={{ width: '100%', position: 'absolute' }} alt="" />}
    <Image src={overlay} sx={{ width: '100%', position: 'absolute' }} alt="" />
  </Ratio>
);
