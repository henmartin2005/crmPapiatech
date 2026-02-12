"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                callbackUrl: "/dashboard",
            });

            if (result?.error) {
                setError(result.error === "CredentialsSignin"
                    ? "Email o contraseña incorrectos."
                    : "Error al iniciar sesión.");
            }
        } catch (err: any) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="mb-4">
                <Image
                    src="/logo-papia.png"
                    alt="Logo Papia Technology Solutions"
                    width={180}
                    height={180}
                    className="mx-auto"
                />
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-center mb-8 text-[#1a1a1a]">
                CRM Papia Technology Solutions LLC
            </h1>

            <Card className="w-full max-w-sm border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold text-slate-700">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-all h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="Contraseña" className="font-semibold text-slate-700">
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
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all h-12 pr-10 rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="rounded-xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-purple-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <LogIn className="mr-2 h-5 w-5" />
                            )}
                            Iniciar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <footer className="mt-8 text-slate-400 text-sm font-medium">
                © {new Date().getFullYear()} Papia Technology Solutions LLC
            </footer>
        </div>
    );
}
