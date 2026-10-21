import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Sends a new support ticket / message into the database.
 */
export async function createSupportTicket({ subject = 'General Inquiry', message }) {
  if (!isSupabaseConfigured) {
    return {
      id: `local-${Date.now()}`,
      subject,
      message,
      status: 'open',
      created_at: new Date().toISOString(),
    }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const guestId = sessionData?.session?.user?.id

  if (!guestId) {
    // Unauthenticated guest message
    return {
      id: `anon-${Date.now()}`,
      subject,
      message,
      status: 'open',
      created_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{ guest_id: guestId, subject, message, status: 'open' }])
    .select()
    .single()

  if (error) {
    console.warn('[createSupportTicket] Error saving support ticket:', error)
    return {
      id: `fallback-${Date.now()}`,
      subject,
      message,
      status: 'open',
      created_at: new Date().toISOString(),
    }
  }

  return data
}

/**
 * Lists the logged-in customer's support tickets.
 */
export async function listSupportTickets() {
  if (!isSupabaseConfigured) return []

  const { data: sessionData } = await supabase.auth.getSession()
  const guestId = sessionData?.session?.user?.id
  if (!guestId) return []

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('[listSupportTickets] Error fetching tickets:', error)
    return []
  }

  return data
}
