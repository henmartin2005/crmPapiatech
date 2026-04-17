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
  // Durante el build de Vercel (prerendering), las variables de entorno pueden no estar presentes.
  // Usamos placeholders que parezcan URLs válidas para evitar que @supabase/ssr lance un error fatal.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Instancia lista para usar en componentes de cliente
export const supabase = createClient()
