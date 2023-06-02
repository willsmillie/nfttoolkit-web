import { Typography, Stack, Grid, Box } from '@mui/material';

const Style = {
  propBox: {
    padding: '8px',
    borderRadius: '8px',
    borderColor: 'primary.main',
    bgcolor: 'background.paper',
    border: 1,
  },
};

const TokenInfo = ({ token }) => (
  <Stack>
    <Typography>{token?.description ?? ''}</Typography>
    <Stack spacing={1}>
      <Typography variant="h5">Properties</Typography>
      <Grid container xs={12} spacing={1} justifyContent="space-between" alignItems="stretch">
        {Object.keys(token?.properties ?? {}).map((key) => (
          <PropBox title={key} key={key} prop={token?.properties[key]} />
        ))}
      </Grid>
    </Stack>
  </Stack>
);

const PropBox = ({ title, prop }) => (
  <Grid item xs={6}>
    <Box sx={Style.propBox}>
      <Stack>
        <Typography>
          <b>{title}</b>
        </Typography>
        <Typography>{prop}</Typography>
      </Stack>
    </Box>
  </Grid>
);

export default TokenInfo;
