"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CalendarDays,
    List,
    CheckCircle2,
    Circle,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ClipboardList,
    Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Task = {
    id: string;
    patient_id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    patients?: { name: string } | null;
};

type FilterType = "all" | "pending" | "completed";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("all");
    const [calendarDate, setCalendarDate] = useState(new Date());

    const fetchTasks = async () => {
        setLoading(true);
        let query = supabase
            .from("client_tasks")
            .select("*, patients(name)")
            .order("due_date", { ascending: true });

        if (filter === "pending") query = query.eq("status", "pending");
        if (filter === "completed") query = query.eq("status", "completed");

        const { data } = await query;
        setTasks(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleToggleTask = async (task: Task) => {
        const newStatus = task.status === "pending" ? "completed" : "pending";
        await supabase
            .from("client_tasks")
            .update({
                status: newStatus,
                completed_at: newStatus === "completed" ? new Date().toISOString() : null,
            })
            .eq("id", task.id);
        await fetchTasks();
    };

    // ---- CALENDAR HELPERS ----
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    }, [year, month]);

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach((t) => {
            const d = new Date(t.due_date);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!map[key]) map[key] = [];
            map[key].push(t);
        });
        return map;
    }, [tasks]);

    // ---- LIST HELPERS ----
    const groupedByDay = useMemo(() => {
        const groups: { date: string; label: string; tasks: Task[] }[] = [];
        const map = new Map<string, Task[]>();

        tasks.forEach((t) => {
            const d = new Date(t.due_date);
            const key = d.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            const iso = d.toISOString().split("T")[0];
            if (!map.has(iso)) map.set(iso, []);
            map.get(iso)!.push(t);
        });

        map.forEach((taskList, iso) => {
            const d = new Date(iso + "T00:00:00");
            groups.push({
                date: iso,
                label: d.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }),
                tasks: taskList,
            });
        });

        groups.sort((a, b) => a.date.localeCompare(b.date));
        return groups;
    }, [tasks]);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    };

    const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const monthName = calendarDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    const filterCounts = useMemo(() => {
        const allTasks = tasks.length;
        const pending = tasks.filter((t) => t.status === "pending").length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        return { all: allTasks, pending, completed };
    }, [tasks]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-end pb-4 border-b border-slate-200/50 mb-4 shrink-0 px-1">
                <div>
                    <h2 className="text-4xl font-black tracking-tight font-jakarta text-slate-800 flex items-center gap-3">
                        <ClipboardList className="h-9 w-9 text-purple-600" />
                        Tasks
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Manage all client tasks and deadlines.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(["all", "pending", "completed"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${filter === f
                                ? "bg-white text-purple-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {f === "all" && <Filter className="h-3 w-3" />}
                            {f === "pending" && <Circle className="h-3 w-3" />}
                            {f === "completed" && <CheckCircle2 className="h-3 w-3" />}
                            {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Completadas"}
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/70">
                                {filterCounts[f]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full flex-1 flex flex-col min-h-0">
                <div className="shrink-0 px-1 mb-4">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
                        <TabsTrigger
                            value="list"
                            className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                        >
                            <List className="h-4 w-4 mr-2" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                        >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Calendario
                        </TabsTrigger>
                    </TabsList>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mr-3" />
                        <span className="font-bold text-lg">Cargando tareas...</span>
                    </div>
                ) : (
                    <>
                        {/* ============ LIST VIEW ============ */}
                        <TabsContent value="list" className="flex-1 mt-0 outline-none overflow-y-auto px-1 pb-4">
                            {groupedByDay.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
                                    <p className="text-lg font-bold">No hay tareas</p>
                                    <p className="text-sm">Abre un cliente y crea una tarea desde su perfil</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {groupedByDay.map((group) => {
                                        const isGroupToday = group.date === today.toISOString().split("T")[0];
                                        return (
                                            <div key={group.date}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`h-8 px-4 flex items-center rounded-full text-xs font-black uppercase tracking-wider ${isGroupToday
                                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200"
                                                        : "bg-slate-100 text-slate-500"
                                                        }`}>
                                                        {isGroupToday ? "📌 Hoy" : group.label}
                                                    </div>
                                                    <div className="flex-1 h-px bg-slate-100" />
                                                </div>
                                                <div className="space-y-2 ml-2">
                                                    {group.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-slate-50 hover:shadow-md transition-all group ${task.status === "completed" ? "opacity-60" : ""
                                                                }`}
                                                        >
                                                            <button
                                                                onClick={() => handleToggleTask(task)}
                                                                className="shrink-0"
                                                            >
                                                                {task.status === "completed" ? (
                                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                                ) : (
                                                                    <Circle className="h-6 w-6 text-slate-300 group-hover:text-purple-400 transition-colors" />
                                                                )}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold text-sm ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"
                                                                    }`}>
                                                                    {task.title}
                                                                </p>
                                                                {task.description && (
                                                                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-purple-50 text-purple-700 border-none font-bold text-[10px] gap-1"
                                                                >
                                                                    <User className="h-3 w-3" />
                                                                    {task.patients?.name || "Sin cliente"}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 text-slate-400">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span className="text-xs font-bold">
                                                                        {formatTime(task.due_date)}
                                                                    </span>
                                                                </div>
                                                                <Badge
                                                                    variant={task.status === "completed" ? "default" : "secondary"}
                                                                    className={
                                                                        task.status === "completed"
                                                                            ? "bg-emerald-100 text-emerald-700 border-none font-bold text-[10px]"
                                                                            : "bg-amber-50 text-amber-700 border-none font-bold text-[10px]"
                                                                    }
                                                                >
                                                                    {task.status === "completed" ? "Completada" : "Pendiente"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        {/* ============ CALENDAR VIEW ============ */}
                        <TabsContent value="calendar" className="flex-1 mt-0 outline-none overflow-y-auto px-1 pb-4">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-50 p-6">
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={prevMonth}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                                    </button>
                                    <h3 className="text-xl font-black capitalize text-slate-800 font-jakarta">
                                        {monthName}
                                    </h3>
                                    <button
                                        onClick={nextMonth}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5 text-slate-600" />
                                    </button>
                                </div>

                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                                        <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, i) => {
                                        if (day === null) {
                                            return <div key={`empty-${i}`} className="min-h-[80px]" />;
                                        }

                                        const key = `${year}-${month}-${day}`;
                                        const dayTasks = tasksByDate[key] || [];
                                        const todayClass = isToday(day);

                                        return (
                                            <div
                                                key={`day-${day}`}
                                                className={`min-h-[80px] rounded-xl p-1.5 border transition-all ${todayClass
                                                    ? "bg-purple-50 border-purple-200 shadow-sm"
                                                    : "border-transparent hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div className={`text-xs font-bold mb-1 text-right pr-1 ${todayClass ? "text-purple-700" : "text-slate-400"
                                                    }`}>
                                                    {day}
                                                </div>
                                                <div className="space-y-0.5">
                                                    {dayTasks.slice(0, 3).map((t) => {
                                                        const isOverdue = t.status === "pending" && new Date(t.due_date) < new Date();
                                                        return (
                                                            <div
                                                                key={t.id}
                                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate cursor-default ${t.status === "completed"
                                                                        ? "bg-emerald-100 text-emerald-700 line-through"
                                                                        : isOverdue
                                                                            ? "bg-amber-900/15 text-amber-900 border border-amber-800/20"
                                                                            : "bg-purple-100 text-purple-700"
                                                                    }`}
                                                                title={`${t.title} - ${t.patients?.name || ""} (${formatTime(t.due_date)})${isOverdue ? " ⚠️ VENCIDA" : ""}`}
                                                            >
                                                                {isOverdue && "⚠ "}{t.title}
                                                            </div>
                                                        );
                                                    })}
                                                    {dayTasks.length > 3 && (
                                                        <div className="text-[9px] font-bold text-slate-400 px-1.5">
                                                            +{dayTasks.length - 3} más
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
