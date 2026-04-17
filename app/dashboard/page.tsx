"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Briefcase, TrendingUp, MessageSquare, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { format, isToday, isFuture, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type Stat = {
    title: string;
    value: string;
    icon: any;
    trend: string;
    color: string;
};

type Activity = {
    id: string;
    content: string;
    created_at: string;
    patients?: { name: string };
};

type Task = {
    id: string;
    title: string;
    due_date: string;
    status: string;
    patients?: { name: string };
};

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);
    const [stats, setStats] = useState<Stat[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            // 1. Auth check
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                router.replace("/");
                return;
            }

            if (!mounted) return;
            setEmail(user.email ?? null);

            // 2. Fetch Stats
            const [
                totalClientsRes,
                appointmentsTodayRes,
                activeServicesRes,
                activityRes,
                tasksRes
            ] = await Promise.all([
                supabase.from("patients").select("*", { count: "exact", head: true }),
                supabase.from("client_tasks").select("*", { count: "exact", head: true })
                    .eq("status", "pending")
                    .gte("due_date", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
                    .lte("due_date", new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
                supabase.from("patients").select("service"), 
                supabase.from("client_notes").select("id, content, created_at, patients(name)").order("created_at", { ascending: false }).limit(5),
                supabase.from("client_tasks").select("id, title, due_date, status, patients(name)").eq("status", "pending").order("due_date", { ascending: true }).limit(5)
            ]);

            if (!mounted) return;

            // Process unique services
            const servicesData = activeServicesRes.data || [];
            const uniqueServices = new Set(servicesData.map((p: any) => p.service)).size;

            setStats([
                { title: "Total Clientes", value: (totalClientsRes.count || 0).toString(), icon: Users, trend: "+12%", color: "text-blue-600" },
                { title: "Tareas hoy", value: (appointmentsTodayRes.count || 0).toString(), icon: Calendar, trend: "En progreso", color: "text-purple-600" },
                { title: "Planes Activos", value: uniqueServices.toString(), icon: Briefcase, trend: "+2", color: "text-pink-600" },
                { title: "Crecimiento", value: "18%", icon: TrendingUp, trend: "+4.5%", color: "text-emerald-600" },
            ]);

            setRecentActivity((activityRes.data as any) || []);
            setUpcomingTasks((tasksRes.data as any) || []);
            setLoading(false);
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight font-jakarta">Dashboard Overview</h1>
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
                            <div className="text-3xl font-black font-jakarta">{stat.value}</div>
                            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center">
                                {stat.trend}
                                <span className="text-slate-400 font-medium ml-1">vs el mes pasado</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex items-center justify-between flex-row">
                        <CardTitle className="font-jakarta font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            Actividad Reciente
                        </CardTitle>
                        <button onClick={() => router.push("/dashboard/patients")} className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                            Ver todo <ChevronRight className="h-3 w-3" />
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-bold text-slate-800 truncate">{activity.patients?.name || "Cliente"}</p>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {format(parseISO(activity.created_at), "HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{activity.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-slate-100 rounded-2xl">
                                    <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                                    No hay actividad reciente
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex items-center justify-between flex-row">
                        <CardTitle className="font-jakarta font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Próximas Tareas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingTasks.length > 0 ? (
                                upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {format(parseISO(task.due_date), "dd")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {task.patients?.name || "Cliente"}
                                                </span>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <span className={`text-[10px] font-black uppercase ${isToday(parseISO(task.due_date)) ? "text-amber-500" : "text-slate-400"}`}>
                                                    {isToday(parseISO(task.due_date)) ? "Hoy" : format(parseISO(task.due_date), "MMM d", { locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="h-5 w-5 text-slate-200 hover:text-emerald-500 transition-colors cursor-pointer" />
                                    </div>
                                ))
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-slate-100 rounded-2xl">
                                    <Clock className="h-8 w-8 mb-2 opacity-20" />
                                    No hay tareas pendientes
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
