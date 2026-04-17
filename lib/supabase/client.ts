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
  // Verificamos si las variables existen antes de inicializar para evitar errores en el build de Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Instancia lista para usar en componentes de cliente
// Usamos una función autoinvocada para evitar errores si las variables faltan en el build
export const supabase = typeof window !== 'undefined' ? createClient() : null as any
