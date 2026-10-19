import { useSyncExternalStore } from 'react';

const queries = ['(max-width: 650px)', '(max-width: 1150px)'];
function subscribe(onChange) {
  const matches = queries.map(query => window.matchMedia(query));
  matches.forEach(match => match.addEventListener('change', onChange));
  return () => matches.forEach(match => match.removeEventListener('change', onChange));
}
const getPageSize = () => window.matchMedia(queries[0]).matches ? 1 : window.matchMedia(queries[1]).matches ? 2 : 3;

export default function useRoomPageSize() {
  return useSyncExternalStore(subscribe, getPageSize, () => 3);
}
