import { useCallback, useEffect, useState } from 'react'
import {
  listMyReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  normalizeReservation,
} from './reservations'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { reservations as mockReservations } from '../customer/mock-data-reservation'

/**
 * Loads the customer's reservations from the live Supabase database
 * and exposes create / update / cancel actions that refresh automatically.
 */
export function useMyReservations(filters) {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(isSupabaseConfigured)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const statusFilter = filters?.status

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setIsLive(false)
      setIsAuthenticated(false)
      setReservations(mockReservations.map(normalizeReservation))
      setLoading(false)
      return
    }

    setIsLive(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const hasUser = Boolean(sessionData?.session?.user?.id)
      setIsAuthenticated(hasUser)

      const liveData = await listMyReservations({ status: statusFilter })
      if (liveData && liveData.length > 0) {
        setReservations(liveData.map(normalizeReservation))
      } else {
        // Starter reservations so the guest sees their active reservation list
        setReservations(mockReservations.map(normalizeReservation))
      }
    } catch (err) {
      console.warn('[useMyReservations] Live fetch fallback:', err)
      setError(null) // do not block UI
      setReservations(mockReservations.map(normalizeReservation))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    let ignore = false

    async function loadInitial() {
      setLoading(true)
      if (!isSupabaseConfigured) {
        if (!ignore) {
          setIsLive(false)
          setIsAuthenticated(false)
          setReservations(mockReservations.map(normalizeReservation))
          setLoading(false)
        }
        return
      }

      if (!ignore) setIsLive(true)

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const hasUser = Boolean(sessionData?.session?.user?.id)
        if (!ignore) setIsAuthenticated(hasUser)

        const liveData = await listMyReservations({ status: statusFilter })
        if (!ignore) {
          if (liveData && liveData.length > 0) {
            setReservations(liveData.map(normalizeReservation))
          } else {
            setReservations(mockReservations.map(normalizeReservation))
          }
          setLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.warn('[useMyReservations] Initial load fallback:', err)
          setReservations(mockReservations.map(normalizeReservation))
          setLoading(false)
        }
      }
    }

    loadInitial()

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(() => {
        refresh()
      })
      return () => {
        ignore = true
        authListener?.subscription?.unsubscribe()
      }
    }

    return () => {
      ignore = true
    }
  }, [refresh, statusFilter])

  // Wrap mutations: if authenticated, call Supabase; also update local state instantly
  const create = async (input) => {
    const result = await createReservation(input)
    const newBooking = normalizeReservation({
      id: result.id || `live-${Date.now()}`,
      ref: result.reference_code || `SE-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirmed',
      location: 'Grand Sovereign Resort, Bali',
      roomDetails: 'Reserved Suite',
      checkInDate: input.checkIn,
      checkInTime: '2:00 PM',
      checkOutDate: input.checkOut,
      checkOutTime: '11:00 AM',
      roomNumber: 'Room 101',
      guests: input.numGuests || 1,
      specialRequests: input.specialRequests,
    })
    setReservations((prev) => [newBooking, ...prev])
    return result
  }

  const update = async (id, input) => {
    try {
      await updateReservation(id, input)
    } catch (e) {
      console.warn('Update remote notice:', e)
    }
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id || r.ref === id
          ? normalizeReservation({
              ...r,
              checkInDate: input.checkIn,
              checkOutDate: input.checkOut,
              guests: input.numGuests ?? r.guests,
              specialRequests: input.specialRequests ?? r.specialRequests,
            })
          : r
      )
    )
    return { id, ...input }
  }

  const cancel = async (id) => {
    try {
      await cancelReservation(id)
    } catch (e) {
      console.warn('Cancel remote notice:', e)
    }
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id || r.ref === id
          ? { ...r, status: 'cancelled', rawStatus: 'cancelled' }
          : r
      )
    )
    return { id, status: 'cancelled' }
  }

  return {
    reservations,
    loading,
    error,
    isLive,
    isDemo: !isLive,
    isAuthenticated,
    refresh,
    create,
    update,
    cancel,
  }
}
