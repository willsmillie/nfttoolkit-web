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

const TokenInfo = ({ token }) => {
  const decodedString = new DOMParser().parseFromString(token?.attributes, 'text/html').body.textContent;
  const parsedAttributes = decodedString ? JSON.parse(decodedString) : {};
  const properties = parsedAttributes ?? token?.properties ?? [];

  return (
    <Stack>
      <Typography dangerouslySetInnerHTML={{ __html: token?.description ?? 'NFT Description' }} />
      <Stack spacing={1}>
        <Typography variant="h5">Properties</Typography>
        <Grid container xs={12} spacing={1} justifyContent="space-between" alignItems="stretch">
          {properties.map(({ trait_type: traitType, value }) => (
            <PropBox key={traitType} title={traitType} prop={value} />
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
};

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
