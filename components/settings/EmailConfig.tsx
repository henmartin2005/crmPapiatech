"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function EmailConfig() {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    const handleConnect = (provider: "google" | "microsoft") => {
        setConnecting(true);
        // Simulation of OAuth flow
        setTimeout(() => {
            setConnecting(false);
            setConnected(true);
        }, 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Conexión de Email
                </CardTitle>
                <CardDescription>
                    Conecta una cuenta para enviar emails desde el CRM.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {!connected ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
                            onClick={() => handleConnect("google")}
                            disabled={connecting}
                        >
                            <svg className="h-8 w-8" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {connecting ? "Conectando..." : "Conectar Gmail"}
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:border-blue-500/50 hover:bg-blue-50"
                            onClick={() => handleConnect("microsoft")}
                            disabled={connecting}
                        >
                            <svg className="h-8 w-8" viewBox="0 0 23 23">
                                <path fill="#f35325" d="M1 1h10v10H1z" />
                                <path fill="#81bc06" d="M12 1h10v10H12z" />
                                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                <path fill="#ffba08" d="M12 12h10v10H12z" />
                            </svg>
                            {connecting ? "Conectando..." : "Conectar Outlook"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <p className="font-medium text-green-900">admin@papiatech.com</p>
                                <div className="flex items-center gap-1.5 ">
                                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Conectado</Badge>
                                    <span className="text-xs text-green-700">Gmail · OAuth2</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setConnected(false)}>
                            Desconectar
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
