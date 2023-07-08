import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Divider,
} from '@mui/material';
import ReactPlayer from 'react-player';
import { db, timestamp } from '../../utils/firebase';
import Iconify from '../Iconify';
import TokenGateBuilder from '../token/TokenGateBuilder';
import ImageView from '../Image';
import useDebounce from '../../hooks/useDebounce';
import useLoopring from '../../hooks/useLoopring';
import { ipfsToHttp } from '../../utils/ipfs';
import { isYouTubeLink, getThumbForYouTube } from '../../utils/youtube';
import getImageDimensions from '../../utils/getImageDimensions';

const Form = ({ onAddFile }) => {
  const { account } = useLoopring();
  // const [uploadFile, setUploadFile] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [gateIds, setGateIds] = useState([]);
  const [contentType, setContentType] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSubmit = () => {
    const newLink = {
      url: fileUrl,
      name: fileName,
      minter: account,
      dateModified: timestamp,
      gateIds,
    };

    if (thumbnailUrl.length > 0) newLink.thumbnail = thumbnailUrl;
    if (fileSize) newLink.size = fileSize;
    if (contentType) newLink.type = contentType;
    if (imageDimensions) newLink.dimensions = imageDimensions;

    db.collection('files')
      .add(newLink)
      .then((docRef) => docRef.get())
      .then((docSnapshot) => onAddFile({ id: docSnapshot.id, ...docSnapshot.data() }))
      .then(() => setOpenModal(false))
      .catch((error) => console.error('Error adding document:', error));
  };

  const [isAVContent, setIsAVContent] = useState(false);
  const preferredThumbnail = thumbnailUrl.length > 0 ? thumbnailUrl : fileUrl;
  const derivedThumbnail = ipfsToHttp(preferredThumbnail);
  getImageDimensions(derivedThumbnail, setImageDimensions);

  // DeBounce Function
  useDebounce(
    async () => {
      if (fileUrl.length === 0) return;
      const isAV = ReactPlayer.canPlay(fileUrl);
      setIsAVContent(isAV);

      if (isYouTubeLink(fileUrl)) setThumbnailUrl(getThumbForYouTube(fileUrl));

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

  const canSubmit = isValidResource(fileUrl) && fileName.length > 2 && gateIds.length > 0;

  return (
    <div>
      <Button variant="contained" onClick={handleOpenModal}>
        Add Files
      </Button>

      <Dialog fullWidth open={openModal} onClose={handleCloseModal}>
        <DialogTitle> Add Token-Gated File </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {isValidResource(derivedThumbnail) &&
              (isAVContent ? <ReactPlayer url={fileUrl} /> : <ImageView src={derivedThumbnail} />)}
            <Typography variant="caption">
              Enter a url to the content you'd like to token gate. IPFS, Youtube, Vimeo, Images, SoundCloud, etc...
            </Typography>
            <TextField
              label="File Name"
              value={fileName}
              error={fileName.length < 2}
              fullWidth
              onChange={(e) => setFileName(e.target.value)}
            />
            <TextField
              label="Resource URL"
              value={fileUrl}
              error={!isValidResource(fileUrl)}
              fullWidth
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <TextField
              label="Thumbnail URL (optional)"
              value={thumbnailUrl}
              error={thumbnailUrl.length > 0 && !isValidResource(thumbnailUrl)}
              fullWidth
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            <Divider />
            <Typography> Allow holders to view the selected files based on collection or token. </Typography>
            <TokenGateBuilder value={gateIds} onChange={setGateIds} />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'end' }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:save-fill" />}
            disabled={!canSubmit}
            onClick={() => {
              handleSubmit();
            }}
          >
            Save
          </Button>

          <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const isValidResource = (url) => {
  try {
    const pattern = /^(ipfs|http|https):\/\/[^ "]+$/;
    return pattern.test(url);
  } catch (error) {
    return false;
  }
};

export default Form;
