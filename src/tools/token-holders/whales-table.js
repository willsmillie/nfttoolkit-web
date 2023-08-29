import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  {
    field: 'address',
    headerName: 'Address',
    width: 400,
    editable: true,
  },
  {
    field: 'balance',
    headerName: 'Amount',
    width: 150,
    editable: true,
  },
];

const Table = ({ rows }) => (
  <Box sx={{ width: '100%' }}>
    <DataGrid
      rows={Object.keys(rows).map((key) => ({ address: key, balance: rows[key] })) ?? []}
      columns={columns}
      rowHeight={28}
      getRowId={(row) => row.address ?? 0}
      slots={{ toolbar: GridToolbar }}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
          },
        },
        sorting: {
          sortModel: [{ field: 'balance', sort: 'desc' }],
        },
      }}
      checkboxSelection
      disableRowSelectionOnClick
    />
  </Box>
);

export default Table;
