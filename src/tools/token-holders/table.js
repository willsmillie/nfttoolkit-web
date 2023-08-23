import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  {
    field: 'accountId',
    headerName: 'Account ID',
    width: 100,
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 400,
    editable: true,
  },
  {
    field: 'tokenId',
    headerName: 'Token ID',
    width: 150,
    editable: true,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 110,
  },
];

const Table = ({ rows }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows ?? []}
        columns={columns}
        rowHeight={38}
        getRowId={(row) => row.accountId ?? 0}
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
};

export default Table;
