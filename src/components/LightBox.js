// @mui
import { Modal, Box } from '@mui/material';
import ReactPlayer from 'react-player';
// components
import Image from './Image';
import { ipfsToHttp } from '../utils/ipfs';

// ----------------------------------------------------------------------

const DynamicFileView = ({ file }) => {
  const isAV = ReactPlayer.canPlay(file.url);
  const isImage = file.type?.includes('image');

  if (isAV) {
    return <ReactPlayer url={file.url} />;
  }

  if (isImage) {
    return <Image contentMode="fit" key={file.name} alt={ipfsToHttp(file.url)} src={ipfsToHttp(file.url)} />;
  }

  return (
    <embed
      alt={file.name ?? ''}
      title={file.name ?? ''}
      style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF00' }}
      src={ipfsToHttp(file.url)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
};

const LightBox = ({ open, onClose, file }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        // boxShadow: 24,
        p: 2,
      }}
    >
      <DynamicFileView file={file} />
    </Box>
  </Modal>
);

export default LightBox;
