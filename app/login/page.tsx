"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt started for:", email);
        setLoading(true);
        setError(null);

        try {
            console.log("Calling NextAuth signIn...");
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            console.log("NextAuth result:", result);

            if (result?.error) {
                console.error("Sign in error:", result.error);
                setError(result.error === "CredentialsSignin"
                    ? "Email o contraseña incorrectos."
                    : "Error al iniciar sesión: " + result.error);
            } else if (result?.ok) {
                console.log("Sign in successful, redirecting to dashboard...");
                router.push("/dashboard");
                router.refresh();
            } else {
                console.log("Sign in returned unexpected state:", result);
            }
        } catch (err: any) {
            console.error("Unexpected login error:", err);
            setError("Ocurrió un error inesperado: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
            console.log("Login attempt finished.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">CRM Papiatech</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa a tu cuenta para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@papiatech.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Iniciar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
