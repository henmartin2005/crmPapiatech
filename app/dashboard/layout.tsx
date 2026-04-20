import { createServerSupabaseClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { DashboardShell } from "@/components/layout/Shell";
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  // IMPORTANTE: Usar getUser() en el servidor para validar el token JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/login')
  }

  // Obtener perfil con rol para verificar si está activo
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Si no hay perfil, el usuario acaba de entrar por primera vez o el trigger falló.
  // Intentamos crear el perfil automáticamente con privilegios de admin.
  if (!profile || profileError) {
    console.log(`Perfil no encontrado para el usuario ${user.id}. Intentando crear automáticamente...`)
    
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        role: 'usuario', // Rol por defecto más seguro
      }, { onConflict: 'id' })
      .select('*')
      .single()

    if (newProfile && !createError) {
      profile = newProfile
      console.log(`Perfil creado exitosamente para: ${user.email}`)
    } else {
      console.error('Error al crear perfil automático:', createError)
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Configurando tu cuenta...</h2>
          <p className="text-muted-foreground mb-4">
            Estamos preparando tu perfil de CRM. Por favor, refresca la página en unos segundos.
            {createError && <span className="block text-xs mt-2 text-red-400">Error: {createError.message}</span>}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )
    }
  }

  // La verificación de is_active se omite si la columna no existe en el esquema actual

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
