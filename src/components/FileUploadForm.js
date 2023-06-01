import React, { useState } from 'react';
import { Stack, Box, Typography, TextField, Button, Modal, Paper } from '@mui/material';
import { storage, db } from '../utils/firebase';
import IPFSTree from './IPFSTree';
import TokenGateSourceSelector from './TokenGateSourceSelector';

const Form = ({ nftId, cid, onAddFile }) => {
  const [uploadFile, setUploadFile] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('upload');
  const [name, setName] = useState('');
  const [size, setSize] = useState('');

  const handleFileOptionChange = (e) => {
    setUploadFile(e.target.checked);
  };

  const handleExternalLinkChange = (e) => {
    setExternalLink(e.target.value);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setSelectedFile(event.dataTransfer.files[0]);
  };

  const handleFileInputChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      console.log('upload....');
    } else {
      const newLink = { nftId, url: externalLink, name };
      db.collection('files')
        .add(newLink)
        .then(() => {
          onAddFile(newLink);
        })
        .then(() => {
          setOpenModal(false);
        });
    }
  };
  const onFileClick = ({ id, name, size }) => {
    setExternalLink(`ipfs://${id}`);
    setName(name);
    setSize(size);
  };

  const canSubmit = selectedFile || externalLink?.length > 5;
  return (
    <div>
      <Button variant="contained" onClick={handleOpenModal}>
        Add Files
      </Button>

      <Modal open={openModal} onClose={handleCloseModal} fullScreen>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Stack spacing={2} alignItems="center" justifyContent="stretch">
            <TokenGateSourceSelector {...{ selectedOption, setSelectedOption }} />
            {selectedOption === 'upload' && (
              <Paper
                sx={{ p: 8, border: '2px dashed #999', borderRadius: '4px' }}
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {selectedFile ? (
                  <Typography>{selectedFile.name}</Typography>
                ) : (
                  <Typography>Drag and drop a file here or click to browse</Typography>
                )}
                <input type="file" onChange={handleFileInputChange} style={{ display: 'none' }} />
                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                  Browse
                  <input type="file" hidden onChange={handleFileInputChange} />
                </Button>
              </Paper>
            )}

            {selectedOption === 'ipfs' && <IPFSTree cid={cid} onFileClick={onFileClick} />}

            {selectedOption === 'url' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <TextField
                  label="External URL (youtube, vimeo, etc)"
                  fullWidth
                  onChange={(e) => setExternalLink(e.target.value)}
                />
              </Box>
            )}
            <TextField
              value={name}
              placeholder="file_name.txt"
              label="Name"
              onChange={(e) => setName(e.target.value)}
            />
            <Stack direction="row" sx={{ width: '100%' }}>
              <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ ml: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!canSubmit}
                onClick={handleSubmit}
                sx={{ ml: 2, width: '90%' }}
                fullWidth
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default Form;
