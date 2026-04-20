"use client";

import { EmailConfig } from "@/components/settings/EmailConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Smartphone } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                    <Settings className="h-4 w-4 text-orange-primary" /> Configuración General
                </h1>
                <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                    Gestiona tu cuenta y preferencias del sistema
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <EmailConfig />

                    <Card className="border-border-primary shadow-sm rounded-[11px]">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-[13.5px] font-semibold text-text-main flex items-center gap-2">
                                <Bell className="h-4 w-4 text-info" /> Notificaciones
                            </CardTitle>
                            <CardDescription className="text-[11px] font-medium text-text-placeholder">
                                Define cómo y cuándo quieres que te avisemos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex items-center justify-between p-4 bg-[#fafaf9] rounded-xl border border-border-primary/50">
                                <div className="space-y-0.5">
                                    <Label className="text-[11.5px] font-semibold text-text-main">Leads Nuevos</Label>
                                    <p className="text-[10px] text-text-placeholder font-medium">Recibir alerta inmediata por email/app</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-orange-primary" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[#fafaf9] rounded-xl border border-border-primary/50">
                                <div className="space-y-0.5">
                                    <Label className="text-[11.5px] font-semibold text-text-main">Resumen Diario</Label>
                                    <p className="text-[10px] text-text-placeholder font-medium">Reporte de actividad al final del día</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-orange-primary" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-border-primary shadow-sm rounded-[11px] bg-orange-light/20 border-orange-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-[13.5px] font-semibold text-orange-dark flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Seguridad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="space-y-3">
                                <p className="text-[10.5px] text-orange-dark/80 font-medium leading-relaxed">
                                    Tu cuenta está protegida por Google OAuth. No se requiere contraseña adicional.
                                </p>
                                <Button variant="outline" className="w-full text-[11px] font-bold h-9 border-orange-primary/30 text-orange-primary hover:bg-orange-light rounded-xl">
                                    Ver Dispositivos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-border-primary shadow-sm rounded-[11px]">
                         <CardHeader className="pb-4">
                            <CardTitle className="text-[13.5px] font-semibold text-text-main flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-text-placeholder" /> App Móvil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-[11px] text-text-placeholder font-medium leading-relaxed mb-4">
                                Descarga la PWA para acceso rápido desde tu pantalla de inicio.
                            </p>
                            <Button className="w-full h-10 bg-text-main text-white rounded-xl text-[11px] font-bold">
                                Instalar App
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
