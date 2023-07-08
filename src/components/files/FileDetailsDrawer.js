import { useState } from 'react';
import _ from 'lodash';
// @mui
import { Box, Stack, Drawer, Button, Divider, TextField, Typography, IconButton } from '@mui/material';
// utils
import { fData } from '../../utils/formatNumber';
// components
import Iconify from '../Iconify';
import TokenGateBuilder from '../token/TokenGateBuilder';
import useDebounce from '../../hooks/useDebounce';
import { ipfsToHttp } from '../../utils/ipfs';
import getImageDimensions from '../../utils/getImageDimensions';
import { fileFormat } from '../file-thumbnail';
import { ConfirmDialog } from '../custom-dialog';
import { useBoolean } from '../../hooks/use-boolean';

import ImageView from '../Image';

// ----------------------------------------------------------------------

const FileDetailsDrawer = ({ item, open, onClose, onDelete, onUpdate, ...other }) => {
  const { id, name, size, url, gateIds, dimensions, thumbnail, type, dateModified = new Date() } = item;

  const [fileName, setFileName] = useState(name ?? '');
  const [fileUrl, setFileUrl] = useState(url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(thumbnail);
  const [contentType, setContentType] = useState(type ?? '');
  const [fileSize, setFileSize] = useState(size ?? '');
  const [accessGroups, setAccessGroups] = useState(gateIds ?? []);
  const [imageDimensions, setImageDimensions] = useState(dimensions);

  const isChanged =
    !_.isEqual(name, fileName) ||
    !_.isEqual(url, fileUrl) ||
    !_.isEqual(thumbnail, thumbnailUrl) ||
    !_.isEqual(accessGroups, gateIds);

  const [toggleProperties, setToggleProperties] = useState(true);
  const [toggleAccessGroups, setToggleAccessGroups] = useState(true);

  const handleToggleProperties = () => setToggleProperties(!toggleProperties);
  const handleToggleAccessGroups = () => setToggleAccessGroups(!toggleAccessGroups);

  const confirm = useBoolean();

  const onSave = () => {
    const data = {
      id,
      name: fileName,
      url: fileUrl,
      size: fileSize,
      dateModified,
      type: contentType,
    };

    if (thumbnailUrl?.length > 0) data.thumbnail = thumbnailUrl;
    if (imageDimensions?.height && imageDimensions?.width) data.dimensions = imageDimensions;

    onUpdate(data);
  };

  // DeBounce Function
  useDebounce(
    async () => {
      if (fileUrl.length === 0 || !open) return;

      fetch(ipfsToHttp(fileUrl))
        .then((response) => {
          const fetchedType = response.headers.get('content-type');
          setContentType(fetchedType);

          const fetchedSize = response.headers.get('content-length');
          setFileSize(fetchedSize);
        })
        .catch(console.error);
    },
    [fileUrl],
    800
  );

  const thumbnailSrc = ipfsToHttp(thumbnailUrl ?? fileUrl);
  getImageDimensions(thumbnailSrc, setImageDimensions);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        sx={{ zIndex: 1111 }}
        BackdropProps={{
          invisible: true,
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
        {...other}
      >
        <Stack spacing={2.5} justifyContent="center" sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
          <ImageView key={thumbnailSrc} alt={thumbnailSrc} src={thumbnailSrc} />

          <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
            {name}
          </Typography>

          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          <TextField
            id="outlined-basic"
            label="File URL"
            variant="outlined"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />

          <TextField
            id="outlined-basic"
            label="Thumbnail"
            variant="outlined"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack spacing={1.5}>
            <Panel label="Properties" toggle={toggleProperties} onToggle={handleToggleProperties} />

            {toggleProperties && (
              <Stack spacing={1.5}>
                <Row label="Size" value={fData(fileSize)} />
                <Row label="Type" value={fileFormat(contentType)} />
                {imageDimensions && (
                  <>
                    <Row label="Dimensions" value={`${imageDimensions.height} x ${imageDimensions.width}`} />
                    <Row label="Ratio" value={`${(imageDimensions.height / imageDimensions.width).toFixed(2)}`} />
                  </>
                )}
              </Stack>
            )}
          </Stack>

          <Stack spacing={1.5}>
            <Panel label="Access Groups" toggle={toggleAccessGroups} onToggle={handleToggleAccessGroups} />

            {toggleAccessGroups && (
              <TokenGateBuilder
                value={accessGroups}
                onChange={(newValue) => {
                  setAccessGroups(newValue);
                }}
              />
            )}
          </Stack>
        </Stack>

        <Box sx={{ p: 2.5 }}>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<Iconify icon="eva:save-fill" />}
              onClick={onSave}
              disabled={!isChanged}
            >
              Save
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="large"
              startIcon={<Iconify icon="eva:trash-2-outline" />}
              onClick={confirm.onTrue}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Drawer>
      <ConfirmDialog
        sx={{ zIndex: 2000 }}
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {name} </strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDelete(item);
              onClose();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
};
export default FileDetailsDrawer; // ----------------------------------------------------------------------

function Panel({ label, toggle, onToggle, ...other }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Row({ label, value = '' }) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}
