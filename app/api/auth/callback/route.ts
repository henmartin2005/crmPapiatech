import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si hay un error en los parámetros de búsqueda, manejarlo
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}&description=${error_description}`)
  }

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Redirigir a una página de error si algo sale mal
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
