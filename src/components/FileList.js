import React, { useEffect, useState } from 'react';
import { Table, Tooltip, TableBody, IconButton, TableContainer, Box, Stack } from '@mui/material';
import { db } from '../utils/firebase';
import FileUploadForm from './FileUploadForm';
import FileRow from './FileRow';
import { useBalances } from '../hooks/useBalances';
import { emptyRows, TableEmptyRows, TableHeadCustom, TableSelectedAction, TablePaginationCustom } from './table';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'size', label: 'Size', align: 'left', width: 120 },
  { id: 'type', label: 'Type', align: 'center', width: 120 },
  { id: 'dateModified', label: 'Modified', align: 'left', width: 160 },
  { id: 'shared', label: 'Shared', align: 'right', width: 100 },
  { id: '' },
];

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
          <TableHeadCustom
            // order={order}
            // orderBy={orderBy}
            headLabel={TABLE_HEAD}
            // rowCount={tableData.length}
            // numSelected={selected.length}
            // onSort={onSort}
            // onSelectAllRows={(checked) =>
            //   onSelectAllRows(
            //     checked,
            //     tableData.map((row) => row.id)
            //   )
            // }
            sx={{
              '& .MuiTableCell-head': {
                bgcolor: 'transparent',
              },
            }}
          />

          <TableBody>
            {/* {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => ( */}
            {files.map((file) => (
              <FileRow sx={{ maxWidth: '300px' }} key={file.id} row={file} />
            ))}

            {/* <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} /> */}

            {/* <TableNoData isNotFound={isNotFound} /> */}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default FileList;
