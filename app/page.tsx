"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, manda al dashboard. 
  // O si venimos con un código de autenticación en la URL, procesarlo.
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      // 1. Verificar si ya existe una sesión
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      // 2. Si hay un ?code= en la URL, significa que Google nos mandó aquí
      // Redirigimos manualmente al callback para que procese el login
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code && isMounted) {
        router.replace(`/api/auth/callback?code=${code}`);
      }
    };

    checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && isMounted) router.replace("/dashboard");
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setError("Email o contraseña incorrectos.");
      return;
    }

    // Login OK
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-6 font-jakarta overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED] rounded-full blur-[120px] opacity-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E91E90] rounded-full blur-[120px] opacity-10 animate-pulse" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
          <Image
            src="/logo-papia.png"
            alt="Logo Papia Technology Solutions"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-[#1a1a1a] font-jakarta tracking-tight">
          CRM Papia Technology Solutions LLC
        </h1>

        <Card className="w-full max-w-[400px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-800 text-sm ml-1">
                  Correo electrónico
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-100 focus:border-purple-300 focus:ring-purple-100 transition-all h-14 rounded-2xl px-5 text-base shadow-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-slate-800 text-sm ml-1">
                  Contraseña
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-100 focus:border-purple-300 focus:ring-purple-100 transition-all h-14 pr-12 rounded-2xl px-5 text-base shadow-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-none bg-red-50 text-red-600 shadow-sm animate-in fade-in slide-in-from-top-2"
                >
                  <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl font-black text-lg bg-gradient-to-r from-[#7C3AED] to-[#E91E90] text-white hover:opacity-95 transition-all active:scale-[0.98] shadow-xl shadow-purple-200 mt-2 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">O continúa con</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-2xl font-bold text-slate-700 border-slate-100 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="mt-12 text-slate-400 text-sm font-bold tracking-wide">
          © 2026 Papia Technology Solutions LLC
        </footer>
      </div>
    </div>
  );
}
