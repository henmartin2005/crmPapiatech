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
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLog(prev => [`[${timestamp}] ${msg}`, ...prev]);
        console.log(msg);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        addLog("Login attempt started for: " + email);
        setLoading(true);
        setError(null);

        try {
            addLog("Calling NextAuth signIn...");
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            addLog("NextAuth result: " + JSON.stringify(result));

            if (result?.error) {
                addLog("Sign in error: " + result.error);
                setError(result.error === "CredentialsSignin"
                    ? "Email o contraseña incorrectos."
                    : "Error al iniciar sesión: " + result.error);
            } else if (result?.ok) {
                addLog("Sign in successful, redirecting...");
                router.push("/dashboard");
                router.refresh();
            } else {
                addLog("Sign in returned unexpected state.");
            }
        } catch (err: any) {
            addLog("Unexpected login error: " + err.message);
            setError("Ocurrió un error inesperado: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
            addLog("Login attempt finished.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
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
                {debugLog.length > 0 && (
                    <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                        <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground underline">Debug Log:</p>
                        <div className="w-full max-h-32 overflow-y-auto bg-black p-2 rounded text-[10px] font-mono text-green-400">
                            {debugLog.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
