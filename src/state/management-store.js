import { useSyncExternalStore } from 'react';
import * as seed from './management-seed';
import { asReservationRooms, saveBooking, transitionBooking, saveRoom, removeRoom, sendSupportMessage } from './management-model';

// Module lifetime deliberately matches the existing mock-state lifecycle: reset on reload.
let state = {
  rooms: seed.rooms,
  reservations: seed.reservations.map(r => ({ ...r, rate: seed.rooms.find(room => room.id === r.roomId).price })),
  accounts: seed.accounts, reviews: seed.reviews,
  tickets: seed.tickets.map(t => ({ ...t, messages: t.messages.map(m => {
    const [hour, minute] = m.time.match(/\d+/g).map(Number);
    return { ...m, createdAt: `2026-10-12T${String(hour + 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00` };
  }) })),
  adminProfile: structuredClone(seed.profile), staffProfile: structuredClone(seed.profile),
};
const listeners = new Set();
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => state;
function publish(next) { state = next; listeners.forEach(listener => listener()); }
export function useManagement() { return useSyncExternalStore(subscribe, snapshot, snapshot); }
export function useManagementCollection(key) {
  const data = useManagement()[key];
  return [data, update => publish({ ...state, [key]: typeof update === 'function' ? update(state[key]) : update })];
}
function commit(action) {
  try { publish(action(state)); return ''; }
  catch (error) { return error.message; }
}
export const managementActions = {
  saveBooking: value => commit(s => saveBooking(s, value)),
  transitionBooking: (id, next) => commit(s => transitionBooking(s, id, next)),
  saveRoom: value => commit(s => saveRoom(s, value)),
  removeRoom: id => commit(s => removeRoom(s, id)),
  sendSupportMessage: (id, text) => commit(s => sendSupportMessage(s, id, text)),
};
export function useReservationRooms() { return asReservationRooms(useManagement().rooms); }
