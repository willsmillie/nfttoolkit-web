import { useState, useEffect } from 'react';
// @mui
import { Typography, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
import TokenGateBuilder from '../../../components/token/TokenGateBuilder';

const FileGateManager = ({ files, open, onClose, onSave }) => {
  const [gateIds, setGateIds] = useState([]);

  useEffect(() => {
    const uniqueGateIds = [
      ...new Set(
        files?.reduce((accumulator, file) => {
          if (file.gateIds) {
            accumulator = accumulator.concat(file.gateIds);
          }
          return accumulator;
        }, [])
      ),
    ];
    setGateIds(uniqueGateIds);

    return () => {};
  }, [files]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle> Access Groups </DialogTitle>
      <DialogContent>
        <Typography> Allow holders to view the selected files based on collection or token </Typography>

        <ul style={{ marginLeft: '2em', margin: '1em' }}>
          {files?.map((e, index) => (
            <li key={index}>{e?.name}</li>
          ))}
        </ul>

        <TokenGateBuilder value={gateIds} onChange={setGateIds} />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'end' }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:save-fill" />}
          onClick={() => {
            onSave(gateIds);
            setGateIds([]);
          }}
        >
          Save
        </Button>

        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FileGateManager;
