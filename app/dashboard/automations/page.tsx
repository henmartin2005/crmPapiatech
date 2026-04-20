"use client";

import { Zap, Play, Clock, ChevronRight, MoreHorizontal, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AUTOMATIONS = [
    { id: 1, title: "Bienvenida WhatsApp", trigger: "Nuevo Lead", action: "Enviar Mensaje", status: "Active", runs: 242 },
    { id: 2, title: "Recordatorio de Pago", trigger: "Propuesta Aceptada", action: "Enviar Email", status: "Active", runs: 85 },
    { id: 3, title: "Inactividad 7 Días", trigger: "Días sin contacto > 7", action: "Notificar Admin", status: "Inactive", runs: 12 },
];

export default function AutomationsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-primary" /> Automatizaciones
                    </h1>
                    <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                        Optimiza tus flujos de trabajo con triggers y acciones automáticas
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-9 px-4 rounded-xl border-border-primary text-[11px] font-bold gap-2">
                        <Settings2 className="h-3.5 w-3.5 text-text-placeholder" /> Flujos
                    </Button>
                    <Button className="h-9 px-4 rounded-xl bg-orange-primary text-white text-[11px] font-bold hover:bg-orange-dark shadow-sm gap-2">
                        <Plus className="h-3.5 w-3.5" /> Nueva Automatización
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {AUTOMATIONS.map((auto) => (
                    <div key={auto.id} className="bg-white border border-border-primary rounded-[22px] p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                            auto.status === "Active" ? "bg-orange-light text-orange-primary" : "bg-slate-100 text-text-placeholder"
                        )}>
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-[14px] font-semibold text-text-main truncate">{auto.title}</h3>
                                <Badge className={cn(
                                    "text-[9px] font-bold uppercase py-0 px-2 border-none",
                                    auto.status === "Active" ? "bg-success/10 text-success" : "bg-slate-100 text-text-placeholder"
                                )}>
                                    {auto.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-text-placeholder">
                                <span className="flex items-center gap-1 uppercase tracking-wider"><Play className="h-3 w-3" /> {auto.trigger}</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="flex items-center gap-1 uppercase tracking-wider text-text-secondary"><Clock className="h-3 w-3" /> {auto.action}</span>
                            </div>
                        </div>

                        <div className="text-right px-6 border-x border-border-primary/50">
                            <p className="text-[16px] font-black text-text-main leading-none">{auto.runs}</p>
                            <p className="text-[9px] font-bold text-text-placeholder uppercase tracking-widest mt-1">Ejecuciones</p>
                        </div>

                        <Button variant="ghost" size="icon" className="h-10 w-10 text-text-placeholder hover:text-orange-primary rounded-xl">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="bg-orange-light/30 border border-dashed border-orange-primary/30 rounded-[22px] p-10 text-center space-y-3">
                <p className="text-[11px] font-bold text-orange-primary uppercase tracking-[0.2em]">Crea flujos complejos</p>
                <h3 className="text-[14px] font-semibold text-text-main">¿Necesitas algo a medida?</h3>
                <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                    Nuestro motor de automatización soporta webhooks, integraciones con WhatsApp API y flujos condicionales ramificados.
                </p>
                <Button variant="outline" className="h-9 px-6 rounded-xl border-orange-primary/50 text-orange-primary text-[10px] font-bold uppercase tracking-wider hover:bg-orange-primary hover:text-white transition-all">
                    Explorar Documentación
                </Button>
            </div>
        </div>
    );
}

function Plus({ className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    )
}
