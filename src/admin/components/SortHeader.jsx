export default function SortHeader({ field, sort, onSort, children, className }) {
  const active = sort.key === field;
  return <th className={className} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
    <button type="button" className="cursor-pointer text-inherit" style={{ font: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }} onClick={() => onSort(field)}>{children}{active ? sort.direction === 'asc' ? ' ↑' : ' ↓' : ''}</button>
  </th>;
}
