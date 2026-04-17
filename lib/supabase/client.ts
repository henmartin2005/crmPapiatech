import { createBrowserClient } from '@supabase/ssr'

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// Para Client Components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Instancia lista para usar en componentes de cliente
export const supabase = createClient()
