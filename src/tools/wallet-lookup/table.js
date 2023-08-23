import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import useTokenResolver from 'src/hooks/useTokenResolver';

const TokenNameCell = ({ nftId }) => {
  console.log(nftId);

  const { metadata } = useTokenResolver(nftId);

  return <Typography variant="subtitle2">{metadata?.name}</Typography>;
};

const columns = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    editable: true,
    renderCell: (params) => <TokenNameCell nftId={params.row.nftId} />,
  },
  {
    field: 'balance',
    headerName: 'Amount',
    type: 'number',
    width: 100,
  },
  {
    field: 'nftId',
    headerName: 'NFT ID',
    editable: true,
    width: 400,
  },
  {
    field: 'minter',
    headerName: 'Minter',
    width: 400,
    editable: true,
  },
];

const Table = ({ rows }) => (
  <Box sx={{ width: '100%' }}>
    <DataGrid
      rows={rows ?? []}
      columns={columns}
      rowHeight={38}
      getRowId={(row) => row.nftId ?? 0}
      slots={{ toolbar: GridToolbar }}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
      }}
      checkboxSelection
      disableRowSelectionOnClick
    />
  </Box>
);

export default Table;
