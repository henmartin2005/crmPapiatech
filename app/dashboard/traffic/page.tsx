"use client";

import { Activity, Globe, Monitor, Smartphone, MousePointer2, Users, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrafficPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-primary" /> Tráfico & Analíticas
                </h1>
                <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                    Monitorea el origen y comportamiento de tus visitas web
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <TrafficStat label="Sesiones Totales" value="2,840" detail="+14.2%" color="text-orange-primary" />
                <TrafficStat label="Tasa de Rebote" value="42.5%" detail="-2.1%" color="text-info" />
                <TrafficStat label="Tiempo Promedio" value="1m 24s" detail="+0.8%" color="text-success" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white border border-border-primary rounded-[22px] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider">Principales Fuentes</h3>
                        <Activity className="h-4 w-4 text-orange-primary opacity-20" />
                    </div>
                    <div className="space-y-6">
                        <SourceRow label="Google Search" value="45%" color="bg-orange-primary" />
                        <SourceRow label="Instagram" value="28%" color="bg-pink-500" />
                        <SourceRow label="Directo" value="15%" color="bg-text-main" />
                        <SourceRow label="WhatsApp" value="12%" color="bg-success" />
                    </div>
                </div>

                <div className="bg-white border border-border-primary rounded-[22px] p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-orange-light rounded-full flex items-center justify-center">
                        <MousePointer2 className="h-8 w-8 text-orange-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-[13px] font-semibold text-text-main">Próximamente: Mapas de Calor</h3>
                        <p className="text-[11px] text-text-placeholder max-w-[240px]">
                            Visualiza dónde hacen clic tus usuarios y mejora la tasa de conversión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrafficStat({ label, value, detail, color }: any) {
    return (
        <div className="bg-white border border-border-primary rounded-[22px] p-6 shadow-sm relative overflow-hidden">
            <p className="text-[9.5px] font-bold text-text-placeholder uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h2 className="text-[24px] font-semibold text-text-main tracking-tight">{value}</h2>
                <span className={cn("text-[10px] font-bold flex items-center gap-0.5", color)}>
                    <ArrowUpRight className="h-3 w-3" /> {detail}
                </span>
            </div>
        </div>
    );
}

function SourceRow({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-medium">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-main font-bold">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full transition-all duration-1000", color)} 
                    style={{ width: value }}
                />
            </div>
        </div>
    );
}
