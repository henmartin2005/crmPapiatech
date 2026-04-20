"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Card className="border-border-primary shadow-sm rounded-[11px]">
            <CardHeader className="pb-4">
                <CardTitle className="text-[13.5px] font-semibold text-text-main flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-primary" /> Conexión de Email
                </CardTitle>
                <CardDescription className="text-[11px] font-medium text-text-placeholder">
                    Conecta tu proveedor de correo para enviar propuestas directamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
                {!connected ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center gap-2 border-border-primary hover:border-orange-primary/30 hover:bg-orange-light/30 rounded-xl transition-all group"
                            onClick={() => handleConnect("google")}
                            disabled={connecting}
                        >
                            <svg className="h-6 w-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Gmail</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center gap-2 border-border-primary hover:border-info/30 hover:bg-info/5 rounded-xl transition-all group"
                            onClick={() => handleConnect("microsoft")}
                            disabled={connecting}
                        >
                            <svg className="h-6 w-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 23 23">
                                <path fill="#f35325" d="M1 1h10v10H1z" />
                                <path fill="#81bc06" d="M12 1h10v10H12z" />
                                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                <path fill="#ffba08" d="M12 12h10v10H12z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Outlook</span>
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-orange-light/10 border border-orange-primary/10 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white border border-orange-primary/20 flex items-center justify-center shadow-sm">
                                <Mail className="h-5 w-5 text-orange-primary" />
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold text-orange-dark">admin@papiatech.com</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-orange-primary uppercase tracking-widest bg-orange-light px-1.5 py-0.5 rounded-md">Conectado</span>
                                    <span className="text-[9px] font-medium text-text-placeholder uppercase">Google Workspace</span>
                                </div>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-lg text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50" 
                            onClick={() => setConnected(false)}
                        >
                            Desvincular
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
