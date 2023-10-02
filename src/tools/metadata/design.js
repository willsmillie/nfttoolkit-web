import { useState, useEffect } from 'react';
import {
  InputAdornment,
  Button,
  Typography,
  Stack,
  Badge,
  TextField,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import Iconify from '../../components/Iconify';

const Design = ({ onChangeConfig, canReset, onReset, handleNext }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cid, setCid] = useState('');
  const [subpath, setSubpath] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [collection, setCollection] = useState('');

  useEffect(() => onChangeConfig('name', name), [name, onChangeConfig]);
  useEffect(() => onChangeConfig('description', description), [description, onChangeConfig]);
  useEffect(() => onChangeConfig('animation_url', `ipfs://${cid}`), [cid, onChangeConfig]);
  useEffect(() => onChangeConfig('image', `ipfs://${cid}/${subpath}`), [cid, subpath, onChangeConfig]);
  useEffect(() => onChangeConfig('royalty_percentage', royalty), [royalty, onChangeConfig]);
  useEffect(() => onChangeConfig('collection_metadata', collection), [collection, onChangeConfig]);

  // indicates if the form is complete
  const designIsValid =
    name.length > 0 && description.length > 0 && cid.length > 0 && subpath.length > 0 && collection.length > 0;

  return (
    <>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="start">
        <Typography variant="h2">👾</Typography>
        <Stack alignItems="start" justifyContent="start">
          <Typography variant="h5">Configure</Typography>
          <Typography variant="caption">Setup metadata for your NFT.</Typography>
        </Stack>
        {canReset && (
          <IconButton onClick={onReset}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        )}
      </Stack>
      {/* Album Metadata */}
      <TextField value={name} onChange={(e) => setName(e.target.value)} label="Token Name" />
      <TextField
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        label="Token Description"
        multiline
        rows="4"
      />
      <TextField
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        label="IPFS CID"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="For interactive-mints, upload the folder to IPFS (via Pinata), and enter the generated CID (content identifier) here.">
                <IconButton aria-label="ipfs hint">
                  <Iconify icon="mdi:help-circle" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        value={subpath}
        onChange={(e) => setSubpath(e.target.value)}
        label="Image subpath"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="This is the path to the image within the IPFS folder from the previous step.">
                <IconButton aria-label="subpath hint">
                  <Iconify icon="mdi:help-circle" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        value={collection}
        onChange={(e) => setCollection(e.target.value)}
        label="Collection Url"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="The collection address which this token should display within.">
                <IconButton aria-label="subpath hint">
                  <Iconify icon="mdi:help-circle" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        type="number"
        value={royalty}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0, max: 10 }}
        onChange={(e) => setRoyalty(Number(e.target.value))}
        label="Royalty Percentage"
      />

      <Divider />
      <Button disabled={!designIsValid} variant="contained" color="primary" size="large" onClick={() => handleNext()}>
        Download
      </Button>
    </>
  );
};

export default Design;
