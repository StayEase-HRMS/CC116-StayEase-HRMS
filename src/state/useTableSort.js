import { useState } from 'react';
import { sortRecords } from './management-model';

export function useTableSort(initialKey) {
  const [sort, setSort] = useState({ key: initialKey, direction: 'asc' });
  return {
    sort,
    toggleSort: key => setSort(previous => ({ key, direction: previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc' })),
    sortRows: rows => sortRecords(rows, sort.key, sort.direction),
  };
}
