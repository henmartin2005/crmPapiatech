"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfDay, endOfDay, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabase/client";
import { 
    Clock, 
    User, 
    Plus, 
    Calendar as CalendarIcon,
    Loader2,
    Inbox,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Task {
    id: string;
    title: string;
    due_date: string;
    status: string;
    description: string;
    clients: {
        name: string;
    };
}

export function AppointmentCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [monthTaskDates, setMonthTaskDates] = useState<string[]>([]);

    const fetchTasks = useCallback(async (selectedDate: Date) => {
        setLoading(true);
        const start = startOfDay(selectedDate).toISOString();
        const end = endOfDay(selectedDate).toISOString();

        const { data, error } = await supabase
            .from("tasks")
            .select("*, clients(name)")
            .gte("due_date", start)
            .lte("due_date", end)
            .order("due_date", { ascending: true });

        if (!error && data) {
            setTasks(data as any);
        }
        setLoading(false);
    }, []);

    const fetchMonthIndicators = useCallback(async (currentMonth: Date) => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

        const { data } = await supabase
            .from("tasks")
            .select("due_date")
            .gte("due_date", start)
            .lte("due_date", end);

        if (data) {
            const dates = data
                .filter(t => t.due_date)
                .map(t => {
                    try {
                        const d = parseISO(t.due_date);
                        return d instanceof Date && !isNaN(d.getTime()) ? format(d, "yyyy-MM-dd") : null;
                    } catch { return null; }
                })
                .filter(Boolean) as string[];
            setMonthTaskDates(Array.from(new Set(dates)));
        }
    }, []);

    useEffect(() => {
        if (date) {
            fetchTasks(date);
        }
    }, [date, fetchTasks]);

    useEffect(() => {
        fetchMonthIndicators(new Date());
    }, [fetchMonthIndicators]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full bg-[#fafaf9] p-6 rounded-[22px] border border-border-primary">
            {/* LEFT: Calendar Section */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-4 rounded-[11px] border border-border-primary shadow-sm overflow-hidden">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={es}
                        className="p-0"
                        classNames={{
                            day_selected: "bg-orange-primary text-white hover:bg-orange-dark hover:text-white focus:bg-orange-primary focus:text-white rounded-lg shadow-sm font-bold",
                            day_today: "bg-orange-light text-orange-primary font-bold rounded-lg",
                            day: "h-9 w-9 p-0 font-medium text-[11px] aria-selected:opacity-100 hover:bg-orange-light hover:text-orange-primary rounded-lg transition-all",
                            head_cell: "text-text-placeholder font-bold text-[10px] uppercase tracking-widest pb-3",
                            nav_button: "hover:bg-orange-light rounded-lg h-7 w-7 text-text-placeholder hover:text-orange-primary transition-colors",
                            caption: "flex justify-between items-center py-2 px-1 mb-2",
                            caption_label: "text-[14px] font-semibold text-text-main capitalize",
                        }}
                        components={{
                            Day: ({ date: dayDate, ...props }: any) => {
                                // Defensive check
                                if (!dayDate || !(dayDate instanceof Date) || isNaN(dayDate.getTime())) {
                                    return <div {...props} />;
                                }

                                const dateStr = format(dayDate, "yyyy-MM-dd");
                                const hasTask = monthTaskDates.includes(dateStr);
                                
                                return (
                                    <div className="relative">
                                        <button {...props} />
                                        {hasTask && (
                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-primary/40" />
                                        )}
                                    </div>
                                );
                            }
                        }}
                    />
                </div>

                <div className="bg-white p-6 rounded-[11px] border border-border-primary shadow-sm space-y-4">
                    <div className="h-10 w-10 bg-orange-light rounded-xl flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-orange-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-main">
                            {date && date instanceof Date && !isNaN(date.getTime()) 
                                ? format(date, "EEEE, d 'de' MMMM", { locale: es }) 
                                : "Selecciona una fecha"}
                        </h3>
                        <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                            {tasks.length} eventos programados
                        </p>
                    </div>
                    <div className="pt-2 border-t border-border-primary flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-text-main">{tasks.filter(t => t.status === "completed").length}</span>
                            <span className="text-[8px] font-bold text-text-placeholder uppercase">Hechas</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-lg font-black text-orange-primary">{tasks.filter(t => t.status === "pending").length}</span>
                            <span className="text-[8px] font-bold text-text-placeholder uppercase">Pendientes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Events List */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[15.5px] font-semibold text-text-main">Agenda del Día</h2>
                        <p className="text-[10px] text-text-placeholder font-medium">Gestión de citas y tareas prioritarias</p>
                    </div>
                    <Button className="h-9 px-4 rounded-xl bg-orange-primary text-white text-[11px] font-semibold hover:bg-orange-dark shadow-sm">
                        <Plus className="h-3.5 w-3.5 mr-2" /> Nueva Tarea
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-6 w-6 animate-spin text-orange-primary" />
                            <p className="text-[11px] font-bold text-text-placeholder uppercase tracking-wider">Cargando...</p>
                        </div>
                    ) : tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.id} className="group bg-white border border-border-primary rounded-[11px] p-0 flex items-stretch hover:shadow-md transition-all duration-300 overflow-hidden">
                                <div className="w-20 bg-[#fafafb] group-hover:bg-orange-light/30 border-r border-border-primary flex flex-col items-center justify-center p-4 transition-colors">
                                    <span className="text-[14px] font-black text-text-main leading-none">
                                        {format(parseISO(task.due_date), "HH:mm")}
                                    </span>
                                    <span className="text-[8px] font-bold text-text-placeholder uppercase tracking-widest mt-1">
                                        {format(parseISO(task.due_date), "aaa")}
                                    </span>
                                </div>
                                
                                <div className="flex-1 p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "text-[12px] font-semibold truncate",
                                                task.status === "completed" ? "text-text-placeholder line-through" : "text-text-main"
                                            )}>
                                                {task.title}
                                            </h4>
                                            {isToday(parseISO(task.due_date)) && task.status === "pending" && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-primary animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-placeholder uppercase tracking-tight">
                                                <User className="h-3 w-3 text-orange-primary/60" />
                                                {task.clients?.name || "Sin cliente"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-placeholder uppercase tracking-tight">
                                                <Clock className="h-3 w-3 text-info/60" />
                                                {format(parseISO(task.due_date), "d MMM", { locale: es })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <button className={cn(
                                            "h-8 w-8 rounded-full border border-border-primary flex items-center justify-center transition-colors shadow-sm",
                                            task.status === "completed" ? "bg-success border-success text-white" : "bg-white text-text-placeholder hover:border-orange-primary hover:text-orange-primary"
                                        )}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center bg-white border border-dashed border-border-primary rounded-[11px] text-center p-8 space-y-3">
                            <Inbox className="h-10 w-10 text-text-placeholder opacity-20" />
                            <p className="text-[11px] font-bold text-text-placeholder uppercase tracking-widest">Sin compromisos</p>
                            <p className="text-[10px] text-text-placeholder leading-relaxed max-w-[200px]">
                                No hay tareas ni citas para este día. ¡Buen momento para prospectar!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
