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
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import IPFSTree from 'src/components/IPFSTree';
import CollectionSelect from 'src/components/collection-select';
import Iconify from '../../components/Iconify';

const Design = ({ onChangeConfig, canReset, onReset, handleNext }) => {
  const [imageSelectType, setImageSelectType] = useState('subpath');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cid, setCid] = useState('');
  const [subpath, setSubpath] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [collection, setCollection] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleShowGADTree = (e) => setAnchorEl(e.currentTarget);
  const handleHideGADTree = () => setAnchorEl(null);
  const showGADTree = Boolean(anchorEl);
  const id = showGADTree ? 'simple-popover' : undefined;

  useEffect(() => onChangeConfig('name', name), [name, onChangeConfig]);
  useEffect(() => onChangeConfig('description', description), [description, onChangeConfig]);
  useEffect(() => onChangeConfig('animation_url', `ipfs://${cid}`), [cid, onChangeConfig]);
  useEffect(() => {
    if (imageSelectType === 'subpath') {
      onChangeConfig('image', `ipfs://${cid}/${encodeURIComponent(subpath)}`);
    } else {
      onChangeConfig('image', `ipfs://${subpath}}`);
    }
  }, [cid, subpath, onChangeConfig, imageSelectType]);
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
      <TextField id="name" value={name} onChange={(e) => setName(e.target.value)} label="Token Name" />
      <TextField
        id="description"
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
        id="ipfs"
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
      <Stack direction="row" justifyContent="space-between">
        <FormControl sx={{ minWidth: '125px' }}>
          <InputLabel id="image-type-select-label">Image Source</InputLabel>
          <Select
            labelId="image-type-select-label"
            id="image-type-select"
            value={imageSelectType}
            label="Image Select"
            onChange={(e) => setImageSelectType(e.target.value)}
          >
            <MenuItem value={'subpath'}>Subpath</MenuItem>
            <MenuItem value={'ipfs'}>IPFS CID</MenuItem>
          </Select>
        </FormControl>
        <TextField
          value={subpath}
          onChange={(e) => setSubpath(e.target.value)}
          label={imageSelectType === 'subpath' ? 'Image subpath' : 'Image CID'}
          placeholder={
            imageSelectType === 'subpath' ? 'assets/images/cover.png' : 'QmVA8QmYcm2ymVtLf5Wu2mhvtANoHpCW29yAcvZZLgDmFX'
          }
          fullWidth
          id="image"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title={
                    imageSelectType === 'subpath'
                      ? 'This is the path to the image within the IPFS folder from the previous step.'
                      : 'This is the cid for image on IPFS.'
                  }
                >
                  <IconButton aria-label="subpath hint">
                    <Iconify icon="mdi:help-circle" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
        {imageSelectType === 'subpath' && (
          <Button onClick={handleShowGADTree}>
            <PermMediaIcon />
          </Button>
        )}
      </Stack>

      <Popover
        id={id}
        open={showGADTree}
        anchorEl={anchorEl}
        onClose={handleHideGADTree} // Close Popover on blur
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <IPFSTree cid={cid} onFileClick={(e) => setSubpath(e.path)} />
      </Popover>

      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <CollectionSelect value={collection?.url ?? null} onChange={(e) => setCollection(e?.url)} />
      </Stack>

      <TextField
        type="number"
        value={royalty}
        id="royalty"
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
