import { useState, useEffect } from 'react';
import { Button, Typography, Stack, Divider } from '@mui/material';
import Iconify from '../../components/Iconify';

const Design = ({ config, onChangeConfig, handleNext, loading }) => {
  const [image, setImage] = useState(null);

  useEffect(() => onChangeConfig('image', image), [image, onChangeConfig]);
  console.log(config);

  return (
    <>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="start">
        <Typography variant="h2">🧧</Typography>
        <Stack alignItems="start" justifyContent="start">
          <Typography variant="h5">Configure</Typography>
          <Typography variant="caption">Select the redpacket image.</Typography>
        </Stack>
      </Stack>
      <ImageUploader onImageUpload={setImage} />
      <Divider />
      <Button
        disabled={!config.image || loading}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => handleNext()}
      >
        Download
      </Button>
    </>
  );
};

const ImageUploader = ({ onImageUpload }) => {
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    // Assuming you want to trigger the composition automatically after the image upload
    onImageUpload(uploadedFile);
  };

  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<Iconify icon="material-symbols:add-photo-alternate-outline-rounded" />}
      sx={{ marginRight: '1rem' }}
    >
      Select File
      <input type="file" accept=".png,.jpg,.jpeg,.gif" onChange={handleFileChange} style={{ display: 'none' }} />
    </Button>
  );
};

export default Design;
