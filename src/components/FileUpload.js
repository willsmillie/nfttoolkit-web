import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { storage } from '../utils/firebase';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (file) {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(file.name);

      fileRef.put(file).then(() => {
        fileRef.getDownloadURL().then((url) => {
          setFileUrl(url);
        });
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" onClick={handleUpload}>
        Upload
      </Button>
      <br />
      <TextField
        label="File URL"
        value={fileUrl}
        fullWidth
        InputProps={{
          readOnly: true,
        }}
      />
    </div>
  );
};

export default FileUpload;
