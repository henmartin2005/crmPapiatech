"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

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

  // Si ya hay sesión, manda al dashboard
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data.session) router.replace("/dashboard");
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
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

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-6 font-inter overflow-hidden">
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

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-[#1a1a1a] font-outfit tracking-tight">
          CRM Papia Technology Solutions LLC
        </h1>

        <Card className="w-full max-w-[400px] border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-800 text-sm ml-1">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-slate-100 focus:border-purple-300 focus:ring-purple-100 transition-all h-14 rounded-2xl px-5 text-base shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-slate-800 text-sm ml-1">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-slate-100 focus:border-purple-300 focus:ring-purple-100 transition-all h-14 pr-12 rounded-2xl px-5 text-base shadow-sm"
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

              <div className="text-right px-1">
                {/* luego lo conectamos a reset password de Supabase */}
                <a href="#" className="text-sm text-[#7C3AED] hover:text-[#E91E90] font-bold transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-none bg-red-50 text-red-600 shadow-sm animate-in fade-in slide-in-from-top-2"
                >
                  <AlertDescription className="font-bold">{error}</AlertDescription>
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
