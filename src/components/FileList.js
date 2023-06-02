import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableContainer, Stack } from '@mui/material';
import { db } from '../utils/firebase';
import FileUploadForm from './FileUploadForm';
import FileRow from './FileRow';
import { useBalances } from '../hooks/useBalances';

const FileList = ({ nftId, minter, cid }) => {
  const [files, setFiles] = useState([]);
  const { account } = useBalances();
  const canUpload = account?.toLowerCase() === minter;

  useEffect(() => {
    // Fetch the files from Firestore for this nft
    const fetchFiles = async () => {
      await db
        .collection('files')
        .where('nftId', '==', nftId.toLowerCase())
        .get()
        .then((querySnapshot) => {
          const filesData = [];

          querySnapshot.forEach((doc) => {
            filesData.push({ id: doc.id, ...doc.data() });
          });
          console.log(filesData);

          setFiles(filesData);
        })
        .catch((error) => {
          console.log('Error getting documents: ', error);
        });
    };

    fetchFiles();
  }, [nftId]);

  const onAddFile = (file) => {
    setFiles([...files, file]);
    console.log('ADDED FILE: ', file);
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 'grow' }}>
        <h2>File List</h2>
        {canUpload && <FileUploadForm nftId={nftId} cid={cid} onAddFile={onAddFile} />}
      </Stack>
      <TableContainer>
        <Table
          size={'small'}
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
            '& .MuiTableCell-head': {
              boxShadow: 'none !important',
            },
          }}
        >
          <TableBody>
            {files.map((file) => (
              <FileRow sx={{ maxWidth: '300px' }} key={file.id} row={file} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default FileList;
