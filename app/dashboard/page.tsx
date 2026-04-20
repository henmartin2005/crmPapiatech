"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
    Users, 
    TrendingUp, 
    Clock, 
    BarChart3,
    ArrowRight,
    CheckSquare,
    CalendarDays,
    MessageCircle,
    UserPlus,
    Calendar,
    Search,
    ChevronDown,
    Plus,
    Download
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { cn, normalizeStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        clientsDelta: 0,
        activeRevenue: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        newLeadsMonth: 0,
        upcomingAppointments: 0
    });
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [leadSources, setLeadSources] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all raw data for calculation (No joins for stability)
                const { data: clientsData } = await supabase.from("clients").select("*");
                const { data: pipelineData } = await supabase.from("pipelines").select("*").order("position", { ascending: true });
                const { data: tasksData } = await supabase.from("client_tasks").select("*").eq("status", "pending");
                const { data: appointmentsData } = await supabase.from("client_appointments").select("*");

                // --- 1. KPI & DELTA LOGIC ---
                const now = new Date();
                const thisMonthStart = startOfMonth(now);
                const lastMonthStart = startOfMonth(subMonths(now, 1));
                const lastMonthEnd = endOfMonth(subMonths(now, 1));

                const clientsThisMonth = clientsData?.filter(c => new Date(c.created_at) >= thisMonthStart).length || 0;
                const clientsLastMonth = clientsData?.filter(c => 
                    isWithinInterval(new Date(c.created_at), { start: lastMonthStart, end: lastMonthEnd })
                ).length || 0;

                const clientsDelta = clientsThisMonth; // "↑ X este mes" usually refers to current month count in these designs

                const activeRevenue = clientsData?.reduce((acc, curr) => {
                    const val = Number(curr.project_value) || Number(String(curr.estimated_budget || "").replace(/[^0-9.]/g, "")) || 0;
                    return acc + val;
                }, 0) || 0;

                const overdueCount = tasksData?.filter(t => new Date(t.due_date) < now).length || 0;

                setStats({
                    totalClients: clientsData?.length || 0,
                    clientsDelta,
                    activeRevenue,
                    pendingTasks: tasksData?.length || 0,
                    overdueTasks: overdueCount,
                    newLeadsMonth: clientsThisMonth,
                    upcomingAppointments: appointmentsData?.length || 0
                });

                // --- 2. PIPELINE MAPPING (SCALED) ---
                const basePipelines = (pipelineData && pipelineData.length > 0) ? pipelineData : [
                    { id: "NEW", name: "NEW LEAD", color: "#3B82F6" },
                    { id: "CONTACTED", name: "CONVERSATION", color: "#F59E0B" },
                    { id: "PROPOSAL", name: "PROPOSAL", color: "#10B981" },
                    { id: "PAYMENT", name: "INITIAL PAYMENT", color: "#8B5CF6" },
                    { id: "ACTIVE", name: "TREATMENT", color: "#EC4899" },
                    { id: "INACTIVE", name: "INACTIVE", color: "#6B7280" }
                ];

                const stageCounts = basePipelines.map(p => {
                    const items = clientsData?.filter(c => {
                        const cStat = normalizeStatus(c.status || "").toUpperCase();
                        return cStat === p.name.toUpperCase() || cStat === String(p.id).toUpperCase();
                    }) || [];
                    const value = items.reduce((acc, curr) => acc + (Number(curr.project_value) || Number(String(curr.estimated_budget || "").replace(/[^0-9.]/g, "")) || 0), 0);
                    return { ...p, count: items.length, value };
                });

                // Scaled relative to the maximum stage count or revenue? 
                // Usually it's relative to the stage with most items in these CRM views.
                const maxStageCount = Math.max(...stageCounts.map(s => s.count), 1);
                setPipelines(stageCounts.map(s => ({ ...s, scale: (s.count / maxStageCount) * 100 })));

                // --- 3. BAR CHART LOGIC (Oct-Abr style) ---
                // We'll generate 7 months ending in current month
                const months = Array.from({ length: 7 }, (_, i) => {
                    const d = subMonths(now, 6 - i);
                    const label = format(d, "MMM", { locale: es }).charAt(0).toUpperCase() + format(d, "MMM", { locale: es }).slice(1);
                    const count = clientsData?.filter(c => 
                        new Date(c.created_at).getMonth() === d.getMonth() && 
                        new Date(c.created_at).getFullYear() === d.getFullYear()
                    ).length || 0;
                    return { label, count, isCurrent: i === 6 };
                });
                setMonthlyData(months);

                // --- 4. LEAD SOURCES ---
                const sourcesMap: Record<string, number> = {};
                clientsData?.forEach(c => {
                    const src = c.source || c.lead_source || "Directo";
                    sourcesMap[src] = (sourcesMap[src] || 0) + 1;
                });
                const totalSrc = clientsData?.length || 1;
                setLeadSources(Object.entries(sourcesMap).map(([name, count]) => ({
                    name,
                    count,
                    percentage: Math.round((count / totalSrc) * 100),
                    color: getSourceColor(name)
                })).sort((a, b) => b.count - a.count));

                // --- 5. ACTIVITY & TASKS ---
                const { data: act } = await supabase.from("client_notes").select("*, clients(name)").order("created_at", { ascending: false }).limit(6);
                setRecentActivity(act || []);
                const { data: tks } = await supabase.from("client_tasks").select("*, clients(name)").eq("status", "pending").order("due_date", { ascending: true }).limit(5);
                setUpcomingTasks(tks || []);

            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getSourceColor = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('instagram')) return 'bg-[#F97316]';
        if (s.includes('facebook')) return 'bg-[#2563EB]';
        if (s.includes('whatsapp')) return 'bg-[#22C55E]';
        if (s.includes('google')) return 'bg-[#F59E0B]';
        if (s.includes('linkedin')) return 'bg-[#1E40AF]';
        return 'bg-slate-400';
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="h-10 w-10 border-b-2 border-[#F97316] animate-spin rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-[clamp(18px,1.5vw,22px)] font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {new Date().getHours() < 12 ? "Buenos días" : new Date().getHours() < 18 ? "Buenas tardes" : "Buenas noches"}, {profile?.full_name?.split(" ")[0] || "Henrry"}
                        <span className="text-xl animate-bounce-slow">👋</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[clamp(10px,1vw,11.5px)] font-bold text-slate-400 uppercase tracking-widest">
                        <p className="opacity-60">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-red-500 flex items-center gap-1.5">
                                <div className="h-1 w-1 bg-current rounded-full" />
                                {stats.overdueTasks} tareas vencidas
                            </span>
                            <span className="text-[#F97316] flex items-center gap-1.5">
                                <div className="h-1 w-1 bg-current rounded-full" />
                                {stats.upcomingAppointments} citas pendientes
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-[11px] font-black transition-all">
                        <Download className="h-4 w-4 mr-2" /> EXPORTAR
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-[11px] font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                        <Plus className="h-4 w-4 mr-2" /> NEW LEAD
                    </Button>
                </div>
            </div>

            {/* KPI GRID - Fluid scaling metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(12px,1.5vw,20px)]">
                <MetricCard 
                    label="TOTAL CLIENTES" 
                    value={stats.totalClients} 
                    trend={`↑ ${stats.clientsDelta} este mes`}
                    trendColor="text-red-500"
                    borderColor="border-[#F97316]"
                />
                <MetricCard 
                    label="REVENUE ACTIVO" 
                    value={`$${(stats.activeRevenue / 1000).toFixed(1)}k`} 
                    trend="En tratamiento"
                    trendColor="text-green-600"
                    borderColor="border-[#10B981]"
                />
                <MetricCard 
                    label="TAREAS PENDIENTES" 
                    value={stats.pendingTasks} 
                    trend={`${stats.overdueTasks} vencidas`}
                    trendColor="text-[#F59E0B]"
                    borderColor="border-[#F59E0B]"
                />
                <MetricCard 
                    label="NUEVOS LEADS/MES" 
                    value={stats.newLeadsMonth} 
                    trend="Últimos 30 días"
                    trendColor="text-blue-500"
                    borderColor="border-[#3B82F6]"
                />
            </div>

            {/* MAIN WIDGET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[clamp(16px,2vw,28px)]">
                {/* Pipeline Overview */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-7 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col h-[400px]">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Pipeline Overview</h3>
                    <div className="flex-1 space-y-7 pr-2 overflow-y-auto custom-scrollbar">
                        {pipelines.map((p, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end text-[clamp(11px,1vw,12px)] font-bold">
                                    <span className="text-slate-600 tracking-tight">{p.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-medium">{p.count}</span>
                                        <span className="text-slate-200">|</span>
                                        <span className="text-slate-900 font-black">${(p.value / 1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000" 
                                        style={{ 
                                            width: `${Math.max(p.scale, 2)}%`,
                                            backgroundColor: p.color || '#F97316'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Leads Bar Chart */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-[clamp(16px,2vw,28px)] shadow-[0_4px_25px_rgba(0,0,0,0.02)] min-h-[400px] flex flex-col">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Leads por Mes</h3>
                   <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-6">
                       {monthlyData.map((m, i) => {
                           const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
                           const height = (m.count / maxCount) * 100;
                           return (
                               <div key={i} className="flex-1 flex flex-col items-center gap-6 h-full justify-end group">
                                   <div className="relative w-full flex-1 flex flex-col justify-end">
                                        <div 
                                            className={cn(
                                                "w-full rounded-t-xl transition-all duration-700",
                                                m.isCurrent 
                                                    ? "bg-[#F97316] shadow-lg shadow-orange-500/30" 
                                                    : "bg-[#FDDCB5] hover:bg-[#FB923C]/40"
                                            )}
                                            style={{ height: `${Math.max(height, 8)}%` }}
                                        />
                                        <span className={cn(
                                            "absolute -top-8 left-1/2 -translate-x-1/2 text-[10.5px] font-black transition-all",
                                            m.isCurrent ? "text-[#F97316] opacity-100 scale-110" : "text-slate-400 opacity-0 group-hover:opacity-100"
                                        )}>
                                            {m.count}
                                        </span>
                                   </div>
                                   <span className={cn(
                                       "text-[10.5px] font-black uppercase tracking-widest",
                                       m.isCurrent ? "text-slate-900" : "text-slate-400"
                                   )}>
                                       {m.label.slice(0, 3)}
                                   </span>
                               </div>
                           );
                       })}
                   </div>
                </div>

                {/* Lead Sources List */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-[clamp(16px,2vw,28px)] shadow-[0_4px_25px_rgba(0,0,0,0.02)] min-h-[400px] flex flex-col">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Lead Sources</h3>
                    <div className="flex-1 space-y-7">
                        {leadSources.map((src, i) => (
                            <div key={i} className="flex items-center gap-5">
                                <div className={cn("h-2.5 w-2.5 rounded-full", src.color)} />
                                <span className="text-[12px] font-bold text-slate-600 flex-1 truncate">{src.name}</span>
                                <div className="flex items-center gap-5 w-32 shrink-0">
                                    <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                            className={cn("h-full rounded-full opacity-80", src.color)} 
                                            style={{ width: `${src.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 w-8 text-right tabular-nums">{src.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: FEED & TASKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 pb-10">
                {/* Recent Activity */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-[clamp(16px,2.5vw,36px)] shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
                    <h3 className="text-[14px] font-black text-slate-900 mb-10">Actividad Reciente</h3>
                    <div className="space-y-9">
                        {recentActivity.map((activity, i) => {
                            const style = getActivityStyle(activity.content);
                            return (
                                <div key={i} className="flex items-start gap-6 group cursor-pointer">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-sm border",
                                        style.color
                                    )}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#F97316] transition-colors leading-none tracking-tight">
                                                {activity.clients?.name}
                                            </h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {formatDistance(new Date(activity.created_at), new Date())}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-slate-500 font-medium line-clamp-1 opacity-70 leading-relaxed">
                                            {activity.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Tasks Checklist */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-[clamp(16px,2.5vw,36px)] shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
                    <h3 className="text-[14px] font-black text-slate-900 mb-10">Próximas Tareas</h3>
                    <div className="space-y-6">
                        {upcomingTasks.map((task, i) => {
                            const isOverdue = new Date(task.due_date) < new Date();
                            return (
                                <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-all rounded-2xl border border-dashed border-transparent hover:border-slate-200 group">
                                    <button className="mt-1 h-5 w-5 rounded-lg border-2 border-slate-200 flex items-center justify-center transition-all group-hover:border-[#F97316] group-hover:bg-orange-50">
                                        <div className="h-2 w-2 rounded-sm bg-[#F97316] opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-slate-800 tracking-tight mb-1">{task.title}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.clients?.name}</p>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase tabular-nums shrink-0",
                                        isOverdue ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {format(new Date(task.due_date), "dd MMM", { locale: es })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, trendColor, borderColor }: any) {
    return (
        <div className={cn(
            "bg-white p-[clamp(16px,2vw,24px)] rounded-3xl border-l-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-slate-50 flex flex-col justify-between h-[clamp(120px,12vw,144px)] transition-all hover:shadow-xl hover:-translate-y-1",
            borderColor
        )}>
            <p className="text-[clamp(9px,1vw,10.5px)] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
            <div className="flex flex-col">
                <h2 className="text-[clamp(24px,2.5vw,28px)] font-black text-slate-900 tracking-tighter leading-none mb-1.5">
                    {value}
                </h2>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1 w-3 rounded-full opacity-40", borderColor.replace('border-', 'bg-'))} />
                    <p className={cn("text-[clamp(9px,1vw,10.5px)] font-black uppercase tracking-widest", trendColor)}>
                        {trend}
                    </p>
                </div>
            </div>
        </div>
    );
}

const getActivityStyle = (content: string) => {
    const text = content.toLowerCase();
    if (text.includes('movido') || text.includes('cambió')) return { color: 'bg-blue-50/50 text-blue-600 border-blue-100', icon: <ArrowRight className="h-5 w-5" /> };
    if (text.includes('nota')) return { color: 'bg-orange-50/50 text-[#F97316] border-orange-100', icon: <Plus className="h-5 w-5" /> };
    if (text.includes('cita')) return { color: 'bg-amber-50/50 text-amber-600 border-amber-100', icon: <Calendar className="h-5 w-5" /> };
    if (text.includes('tarea')) return { color: 'bg-green-50/50 text-green-600 border-green-100', icon: <CheckSquare className="h-5 w-5" /> };
    return { color: 'bg-slate-50/50 text-slate-600 border-slate-100', icon: <MessageCircle className="h-5 w-5" /> };
};

function formatDistance(from: Date, to: Date) {
    const diff = Math.abs(to.getTime() - from.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return `ayer`;
    return `hace ${days} d`;
}
