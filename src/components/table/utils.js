// ----------------------------------------------------------------------

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy) {
  if (orderBy === 'date') {
    return (a, b) => {
      const dateA = a.dateModified?.toDate?.() || 0;
      const dateB = b.dateModified?.toDate?.() || 0;

      if (dateA < dateB) {
        return order === 'asc' ? -1 : 1;
      } else if (dateA > dateB) {
        return order === 'asc' ? 1 : -1;
      }

      return 0;
    };
  }

  // Add other comparator logic for different orderBy values

  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
