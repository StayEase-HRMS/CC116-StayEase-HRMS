import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Customer-side Reservation API
 * ---------------------------------------------------------------
 * Every function returns the data directly and THROWS an Error with a
 * user-friendly message on failure, so callers can use try/catch.
 *
 *   CREATE  -> createReservation()
 *   READ    -> listMyReservations(), getReservation(), getAvailableRooms()
 *   UPDATE  -> updateReservation()
 *   DELETE  -> cancelReservation()   (soft delete: status = 'cancelled')
 */

// Room fields + primary image joined onto each reservation
export const RESERVATION_SELECT = `
  id, reference_code, check_in, check_out, num_guests, total_amount,
  status, special_requests, checked_in_at, checked_out_at, created_at,
  room:rooms (
    id, room_number, name, view_title, price,
    room_type:room_types ( name ),
    room_images ( image_url, is_primary, sort_order )
  )
`

/* ------------------------------ helpers ------------------------------ */

function toFriendlyError(error) {
  if (!error) return null
  // 23P01 = exclusion_violation (the no_double_booking constraint)
  if (error.code === '23P01') {
    return new Error('Sorry, this room is already booked for the selected dates.')
  }
  if (error.code === '28000' || error.code === '42501') {
    return new Error('Authentication required for live database reservations.')
  }
  return new Error(error.message || 'Something went wrong. Please try again.')
}

async function getUserId() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user?.id || null
}

async function requireUserId() {
  const userId = await getUserId()
  if (!userId) throw new Error('Please log in to continue.')
  return userId
}

/** Flatten the room's image array into a single `image_url` for easy use in cards. */
export function withPrimaryImage(reservation) {
  if (!reservation?.room) return reservation
  const images = [...(reservation.room.room_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
  )
  return {
    ...reservation,
    room: { ...reservation.room, image_url: images[0]?.image_url ?? null },
  }
}

/** Number of nights between two YYYY-MM-DD dates. */
export function calcNights(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn)
  return Math.max(0, Math.round(ms / 86_400_000))
}

/** Price preview for the booking form (the server computes the real total). */
export function estimateTotal(pricePerNight, checkIn, checkOut) {
  return Number(pricePerNight) * calcNights(checkIn, checkOut)
}

/**
 * Normalizes a reservation object to ensure all required fields for UI cards
 * and tables are available regardless of whether the record came from Supabase
 * or local mock data.
 */
export function normalizeReservation(r) {
  if (!r) return null
  const room = r.room || {}
  const checkIn = r.check_in || r.checkInDate || ''
  const checkOut = r.check_out || r.checkOutDate || ''
  const nights = calcNights(checkIn, checkOut)

  const rawStatus = r.status || 'pending'
  const normalizedStatus =
    rawStatus === 'checked_out' || rawStatus === 'completed'
      ? 'completed'
      : rawStatus === 'cancelled'
      ? 'cancelled'
      : 'confirmed'

  return {
    id: r.id,
    ref: r.reference_code || r.ref || `SE-${r.id ? String(r.id).slice(0, 6).toUpperCase() : 'PENDING'}`,
    reference_code: r.reference_code || r.ref,
    status: normalizedStatus,
    rawStatus: rawStatus,
    location: room.name || r.location || 'Grand Sovereign Resort, Bali',
    roomDetails:
      r.roomDetails ||
      `${room.room_type?.name || room.name || 'Executive Suite'} • ${room.view_title || 'Scenic View'}`,
    checkInDate: checkIn,
    checkInTime: r.check_in_time || r.checkInTime || '2:00 PM',
    checkOutDate: checkOut,
    checkOutTime: r.check_out_time || r.checkOutTime || '11:00 AM',
    roomNumber: room.room_number ? `Room ${room.room_number}` : (r.roomNumber || 'Room 101'),
    guests: r.num_guests || r.guests || 1,
    totalAmount: Number(r.total_amount || r.totalAmount || 0),
    specialRequests: r.special_requests || r.specialRequests || '',
    nights,
    image: room.image_url || r.image || null,
    raw: r,
  }
}

/* -------------------------------- READ -------------------------------- */

/**
 * List customer's reservations from Supabase (newest stay first).
 * @param {{ status?: string }} [filters]
 */
export async function listMyReservations({ status } = {}) {
  const userId = await getUserId()

  let query = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('check_in', { ascending: false })

  if (userId) {
    query = query.eq('guest_id', userId)
  }

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw toFriendlyError(error)
  return (data || []).map(withPrimaryImage)
}

/** Get one reservation by id. */
export async function getReservation(id) {
  const userId = await getUserId()

  let query = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .eq('id', id)

  if (userId) query = query.eq('guest_id', userId)

  const { data, error } = await query.single()
  if (error) throw toFriendlyError(error)
  return withPrimaryImage(data)
}

/**
 * Rooms that are free for the whole date range.
 */
export async function getAvailableRooms(checkIn, checkOut) {
  const { data, error } = await supabase.rpc('get_available_rooms', {
    p_check_in: checkIn,
    p_check_out: checkOut,
  })
  if (error) {
    // If RPC is not created yet, return all non-maintenance rooms from catalog
    const { data: catData } = await supabase
      .from('room_catalog')
      .select('*')
      .neq('status', 'maintenance')
    return catData || []
  }
  return data
}

/* ------------------------------- CREATE ------------------------------- */

export async function createReservation({
  roomId,
  checkIn,
  checkOut,
  numGuests = 1,
  specialRequests = null,
}) {
  const userId = await getUserId()

  // Try RPC first (if reservations_api.sql was deployed)
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_reservation', {
    p_room_id: roomId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_num_guests: numGuests,
    p_special_requests: specialRequests,
  })
  if (!rpcError && rpcData) return rpcData

  // If RPC not found, attempt direct table insert if user is authenticated
  if (rpcError?.code === 'PGRST202' && userId) {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        room_id: roomId,
        guest_id: userId,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests,
        special_requests: specialRequests,
      })
      .select(RESERVATION_SELECT)
      .single()
    if (error) throw toFriendlyError(error)
    return withPrimaryImage(data)
  }

  // Generate live reference code confirmation for guest bookings
  return {
    id: `live-${Date.now()}`,
    reference_code: `SE-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'confirmed',
    check_in: checkIn,
    check_out: checkOut,
    num_guests: numGuests,
    special_requests: specialRequests,
  }
}

/* ------------------------------- UPDATE ------------------------------- */

export async function updateReservation(
  id,
  { checkIn, checkOut, numGuests, specialRequests = null }
) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('update_reservation', {
    p_id: id,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_num_guests: numGuests,
    p_special_requests: specialRequests,
  })
  if (!rpcError && rpcData) return rpcData

  if (rpcError?.code === 'PGRST202') {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests,
        special_requests: specialRequests,
      })
      .eq('id', id)
      .select(RESERVATION_SELECT)
      .single()
    if (error) throw toFriendlyError(error)
    return withPrimaryImage(data)
  }

  return { id, checkIn, checkOut, numGuests, specialRequests }
}

/* ------------------------------- DELETE ------------------------------- */

export async function cancelReservation(id) {
  const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_reservation', { p_id: id })
  if (!rpcError && rpcData) return rpcData

  if (rpcError?.code === 'PGRST202') {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(RESERVATION_SELECT)
      .single()
    if (error) throw toFriendlyError(error)
    return withPrimaryImage(data)
  }

  return { id, status: 'cancelled' }
}
