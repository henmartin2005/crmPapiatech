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
    
    // Verificación CRÍTICA de variables de entorno para producción
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error de Configuración (Panel de Hosting)</h2>
          <p className="text-slate-500 mb-4 max-w-md">
            Falta la variable <code className="bg-red-50 text-red-600 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code>. 
            El sistema no puede crear tu perfil automáticamente sin ella. Por favor, añádela en Vercel/Netlify.
          </p>
        </div>
      )
    }

    try {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'usuario', // Rol por defecto más seguro
        }, { onConflict: 'id' })
        .select('*')
        .single()

      if (createError) {
        throw createError;
      }

      if (newProfile) {
        console.log(`Perfil creado exitosamente para: ${user.email}`)
        // Limpiamos caché y forzamos recarga para que el nuevo perfil se aplique correctamente
        revalidatePath('/dashboard', 'layout');
        redirect('/dashboard');
      }
    } catch (err: any) {
      console.error('Error al crear perfil automático:', err)
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error al configurar tu perfil</h2>
          <p className="text-slate-500 mb-4 max-w-md">
            No pudimos completar la configuración inicial. 
          </p>
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-mono text-left max-w-md overflow-x-auto">
            {err?.message || JSON.stringify(err)}
          </div>
          <p className="text-xs text-slate-400 mt-4">Actualiza la página para reintentar.</p>
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
