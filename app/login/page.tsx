"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al intentar iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] p-4 font-sans">
      <Card className="w-full max-w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0ede8] rounded-[22px] overflow-hidden bg-white">
        <CardHeader className="pt-10 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-[#EA580C] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
               <Star className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
              Papiatech CRM
            </CardTitle>
            <CardDescription className="text-[#555555] text-[13px] font-medium">
              Gestión inteligente para tu negocio v2
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-10 space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-none bg-red-50 text-red-600 py-3">
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            variant="outline" 
            type="button" 
            disabled={loading} 
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white border-[#e8e0d8] text-[#1a1a1a] rounded-[14px] text-sm font-semibold hover:bg-[#fafafb] hover:border-[#d4cec8] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#EA580C]" />
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="tracking-tight">Iniciar sesión con Google</span>
              </div>
            )}
          </Button>
          
          <div className="pt-2">
            <p className="text-center text-[10.5px] text-[#aaaaaa] font-medium leading-relaxed">
              Al continuar, confirmas que eres personal autorizado de <br/>
              <span className="text-[#EA580C] font-semibold">Papia Technology Solutions LLC</span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Decorative background element */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-orange-50/50 rounded-full blur-3xl pointer-events-none z-0" />
    </div>
  )
}
