import { useState, useEffect } from 'react';
// @mui
import {
  Button,
  Table,
  Tooltip,
  TableRow,
  Checkbox,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
} from '@mui/material';

import { useBoolean } from '../../../hooks/use-boolean';

// components
import Iconify from '../../../components/Iconify';
import Image from '../../../components/Image';
import Scrollbar from '../../../components/Scrollbar';
import FileDetailsDrawer from '../../../components/files/FileDetailsDrawer';
import { ConfirmDialog } from '../../../components/custom-dialog';

import {
  useTable,
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';

import { fDate } from '../../../utils/formatTime';
import { fData } from '../../../utils/formatNumber';

import { db, timestamp } from '../../../utils/firebase';
import { ipfsToHttp } from '../../../utils/ipfs';
import FileManagerShareDialog from './file-manager-share-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'preview', label: '', align: 'left' },
  { id: 'name', label: 'File Name', align: 'left' },
  { id: 'groups', label: 'Access Groups', align: 'center' },
  { id: 'type', label: 'Type', align: 'center' },
  { id: 'size', label: 'Size', align: 'center' },
  { id: 'date', label: 'Created At', align: 'center' },
];

// ----------------------------------------------------------------------

export default function SortingSelectingTable({ files = [], deleteFile, deleteSelection, updateFile }) {
  const table = useTable({ defaultOrderBy: 'date', defaultOrder: 'desc', defaultDense: true, defaultRowsPerPage: 12 });
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    setTableData(files);
    return () => {};
  }, [files]);

  const [showFileDetails, setShowFileDetails] = useState(null);
  const [showAccessGroupPicker, setShowAccessGroupPicker] = useState(false);
  const denseHeight = table.dense ? 34 : 54;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const applyGatesToSelection = (gateIds) => {
    const batch = db.batch();

    table.selected.forEach((id) => {
      const fileRef = db.collection('files').doc(id);
      batch.update(fileRef, { gateIds, dateModified: timestamp }, { merge: true });
    });

    batch
      .commit()
      .then(() => {
        console.log('Files updated successfully');
        setShowAccessGroupPicker(false);
      })
      .catch((error) => {
        console.error('Error updating files:', error);
      });
  };

  return (
    <div>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              tableData.map((row) => row.id)
            )
          }
          action={
            <>
              <Tooltip title="Access Groups">
                <IconButton
                  color="primary"
                  onClick={() => {
                    setShowAccessGroupPicker(true);
                  }}
                >
                  <Iconify icon="solar:share-bold" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            </>
          }
        />

        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {dataFiltered
                .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id} selected={table.selected.includes(row.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox onClick={() => table.onSelectRow(row.id)} checked={table.selected.includes(row.id)} />
                    </TableCell>
                    <TableCell>
                      <Image sx={{ maxHeight: '25px', maxWidth: '25px' }} src={ipfsToHttp(row.thumbnail ?? row.url)} />{' '}
                    </TableCell>
                    <TableCell onClick={() => setShowFileDetails(row)}> {row.name} </TableCell>
                    <TableCell align="center">{row.gateIds?.length}</TableCell>
                    <TableCell align="center">{row.type}</TableCell>
                    <TableCell align="center">{fData(row.size ?? 0)}</TableCell>
                    <TableCell align="center">
                      {row?.dateModified !== undefined ? fDate(row.dateModified.toDate()) : ''}
                    </TableCell>
                  </TableRow>
                ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {showFileDetails && (
        <FileDetailsDrawer
          sx={{ zIndex: 1500 }}
          item={showFileDetails}
          open={showFileDetails !== null}
          onClose={() => {
            setShowFileDetails(null);
          }}
          onDelete={(file) => deleteFile(file)}
          onUpdate={(file) => updateFile(file)}
        />
      )}

      <TablePaginationCustom
        count={dataFiltered.length ?? 0}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        //
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />

      <FileManagerShareDialog
        files={files?.filter((e) => table.selected.includes(e.id))}
        open={showAccessGroupPicker}
        onSave={applyGatesToSelection}
        onClose={() => {
          setShowAccessGroupPicker(false);
        }}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteSelection(table.selected.map((fileId) => db.collection('files').doc(fileId)));
              confirm.onFalse();
              table.setSelected([]);
            }}
          >
            Delete
          </Button>
        }
      />
    </div>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) return order;

    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  return inputData;
}
