import { useState } from 'react';
// @mui
import { Stack, Checkbox, TableRow, TableCell, Typography } from '@mui/material';
// hooks
import useDoubleClick from '../../hooks/useDoubleClick';
// components
import FileDetailsDrawer from './FileDetailsDrawer';

// ------
export default function FileTableRow({ row, selected, onSelectRow, onDeleteRow, onUpdateRow }) {
  const { name, type } = row;

  const [openDetails, setOpenDetails] = useState(false);

  const handleOpenDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleClick = useDoubleClick({
    click: () => {
      handleOpenDetails();
    },
    doubleClick: () => console.log('DOUBLE CLICK'),
  });

  return (
    <>
      <TableRow
        sx={{
          borderRadius: 1,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
          ...(openDetails && {
            '& .MuiTableCell-root': {
              color: 'text.primary',
              typography: 'subtitle2',
              bgcolor: 'background.default',
            },
          }),
        }}
      >
        <TableCell
          padding="checkbox"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
        >
          <Checkbox checked={selected} onDoubleClick={() => console.log('ON DOUBLE CLICK')} onClick={onSelectRow} />
        </TableCell>

        <TableCell onClick={handleClick}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* <FileThumbnail file={type} /> */}

            <Typography noWrap variant="inherit" sx={{ maxWidth: 360, cursor: 'pointer' }}>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        {/* <TableCell align="left" onClick={handleClick} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {fData(size)}
        </TableCell> */}

        <TableCell align="center" onClick={handleClick} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {type}
        </TableCell>
      </TableRow>

      <FileDetailsDrawer
        sx={{ zIndex: 1500 }}
        item={row}
        open={openDetails}
        onClose={handleCloseDetails}
        onDelete={() => onDeleteRow(row)}
        onUpdate={(file) => onUpdateRow(file)}
      />
    </>
  );
}
