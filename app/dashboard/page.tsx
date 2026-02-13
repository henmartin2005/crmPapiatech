"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Briefcase, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (cancelled) return;

            if (error || !data.user) {
                router.replace("/");
                return;
            }

            setEmail(data.user.email ?? null);
            setLoading(false);
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const stats = [
        { title: "Total Pacientes", value: "1,284", icon: Users, trend: "+12%", color: "text-blue-600" },
        { title: "Citas Hoy", value: "12", icon: Calendar, trend: "En curso", color: "text-purple-600" },
        { title: "Servicios Activos", value: "24", icon: Briefcase, trend: "+2", color: "text-pink-600" },
        { title: "Crecimiento", value: "18%", icon: TrendingUp, trend: "+4.5%", color: "text-emerald-600" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight font-outfit">Panel de Control</h1>
                <p className="text-muted-foreground font-medium">
                    Bienvenido de nuevo, <span className="text-foreground font-bold">{email}</span>. Aquí tienes el resumen de hoy.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black font-outfit">{stat.value}</div>
                            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center">
                                {stat.trend}
                                <span className="text-slate-400 font-medium ml-1">vs mes pasado</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-outfit font-bold">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-slate-100 rounded-2xl">
                            Visualización de actividad en desarrollo...
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-outfit font-bold">Próximas Citas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-slate-100 rounded-2xl">
                            Lista de citas próximas...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
