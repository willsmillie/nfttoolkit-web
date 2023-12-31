import { alpha } from '@mui/material/styles';
import { Grid, Box, Typography, Stack, Paper } from '@mui/material';
import Aspect from 'react-aspect-ratio';

import ScrollBar from '../../components/Scrollbar';
import TokenCard from '../../components/token/TokenCard';

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
        <Grid container spacing={2}>
          {/* Image */}
          <Grid item xs={6}>
            <ScrollBar id="logs" sx={{ p: 3, minWidth: 300 }}>
              <Typography
                sx={{
                  fontFamily: 'Monospace',
                  px: 2,
                  whiteSpace: 'pre-line',
                  textAlign: 'start',
                }}
                variant="caption"
              >
                <br />
                {JSON.stringify(config, null, 2)}
              </Typography>
            </ScrollBar>
          </Grid>
          <Grid item xs={6}>
            <Aspect ratio={9 / 16}>
              <TokenCard metadata={config} />
            </Aspect>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
