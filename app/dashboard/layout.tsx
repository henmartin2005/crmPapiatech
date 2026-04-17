import { createServerSupabaseClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { DashboardShell } from "@/components/layout/Shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  // IMPORTANTE: Usar getUser() en el servidor para validar el token JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/login')
  }

  // Obtener perfil con rol para verificar si está activo
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Si no hay perfil, el usuario acaba de entrar por primera vez.
  // En lugar de redirigir (que causa un loop con el middleware),
  // mostramos un mensaje de espera o error amigable.
  if (!profile || profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Configurando tu cuenta...</h2>
        <p className="text-muted-foreground mb-4">Estamos preparando tu perfil de CRM. Por favor, refresca la página en unos segundos.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  // Verificar si el usuario está activo
  if (!profile.is_active) {
    redirect('/login?error=account_disabled')
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
