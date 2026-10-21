import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { rooms as mockRooms } from '../customer/mock-data-rooms'
import room1Img from '../assets/room_1.jpg'

/**
 * Normalizes a room record from either the database view `room_catalog`
 * or local mock data so the UI receives a uniform structure.
 */
export function normalizeRoom(r) {
  if (!r) return null

  const roomName = r.name || (r.room_number ? `Room ${r.room_number}` : 'Deluxe Room')
  const subtitle = r.room_number && r.view_title
    ? `Room ${r.room_number} • ${r.view_title}`
    : r.view_title || r.subtitle || r.room_type || 'Scenic View'

  return {
    id: r.id,
    name: roomName,
    subtitle,
    description: r.description || '',
    pricePerNight: Number(r.price ?? r.pricePerNight ?? 0),
    status: r.status || 'available', // 'available' | 'reserved' | 'maintenance' | 'occupied'
    rating: Number(r.avg_rating ?? r.rating ?? 4.5),
    reviews: Number(r.review_count ?? r.reviews ?? 0),
    guests: r.max_occupancy ?? r.guests ?? 2,
    amenities: Array.isArray(r.amenities) && r.amenities.length > 0
      ? r.amenities
      : ['Bathroom', 'AC', 'Wi-Fi'],
    featured: Boolean(r.featured ?? (r.status === 'available')),
    image: r.image_url || r.image || room1Img,
    raw: r,
  }
}

/**
 * Fetches the full room catalog from Supabase view `room_catalog`
 * with seamless fallback to mock data when offline or unconfigured.
 */
export async function listRooms() {
  if (!isSupabaseConfigured) {
    return mockRooms.map(normalizeRoom)
  }

  try {
    const { data, error } = await supabase
      .from('room_catalog')
      .select('*')
      .order('room_number', { ascending: true })

    if (error || !data || data.length === 0) {
      return mockRooms.map(normalizeRoom)
    }

    return data.map(normalizeRoom)
  } catch (err) {
    console.warn('[listRooms] Error fetching room catalog from Supabase:', err)
    return mockRooms.map(normalizeRoom)
  }
}

/**
 * React hook to fetch and filter the room catalog.
 */
export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(isSupabaseConfigured)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listRooms()
      setRooms(data)
      setIsLive(isSupabaseConfigured)
    } catch (err) {
      setError(err.message)
      setRooms(mockRooms.map(normalizeRoom))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await listRooms()
        if (!ignore) {
          setRooms(data)
          setIsLive(isSupabaseConfigured)
          setLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message)
          setRooms(mockRooms.map(normalizeRoom))
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  return {
    rooms,
    loading,
    error,
    isLive,
    refresh,
  }
}
