"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfDay, endOfDay, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { 
    Clock, 
    User, 
    Plus, 
    ChevronRight, 
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
    id: string;
    patient_id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    patients: {
        name: string;
        phone: string;
    };
};

export function AppointmentCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [appointments, setAppointments] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [monthTasks, setMonthTasks] = useState<string[]>([]); // Dates with tasks

    const fetchAppointments = useCallback(async (selectedDate: Date) => {
        setLoading(true);
        const start = startOfDay(selectedDate).toISOString();
        const end = endOfDay(selectedDate).toISOString();

        const { data, error } = await supabase
            .from("client_tasks")
            .select("*, patients(name, phone)")
            .gte("due_date", start)
            .lte("due_date", end)
            .order("due_date", { ascending: true });

        if (!error && data) {
            setAppointments(data as any);
        }
        setLoading(false);
    }, []);

    const fetchMonthTaskstatus = useCallback(async (currentMonth: Date) => {
        // Fetch all task dates for the current month to show indicators
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

        const { data } = await supabase
            .from("client_tasks")
            .select("due_date")
            .gte("due_date", start)
            .lte("due_date", end);

        if (data) {
            const dates = data.map(t => format(parseISO(t.due_date), "yyyy-MM-dd"));
            setMonthTasks(Array.from(new Set(dates)));
        }
    }, []);

    useEffect(() => {
        if (date) {
            fetchAppointments(date);
        }
    }, [date, fetchAppointments]);

    useEffect(() => {
        fetchMonthTaskstatus(new Date());
    }, [fetchMonthTaskstatus]);

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
            {/* Sidebar: Calendar & Quick Info */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            locale={es}
                            className="w-full"
                            classNames={{
                                day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white rounded-xl shadow-lg shadow-purple-200",
                                day_today: "bg-purple-50 text-purple-700 font-bold rounded-xl",
                                day: "h-12 w-12 text-sm font-medium hover:bg-slate-100 rounded-xl transition-all",
                                head_cell: "text-slate-400 font-bold text-xs uppercase tracking-widest pb-4",
                                nav_button: "hover:bg-slate-100 rounded-lg h-8 w-8",
                                caption: "flex justify-between items-center py-2 px-1 mb-4",
                                caption_label: "text-lg font-black font-jakarta text-slate-800 capitalize",
                            }}
                            components={{
                                Day: ({ date: dayDate, ...props }: any) => {
                                    const dateStr = format(dayDate, "yyyy-MM-dd");
                                    const hasTask = monthTasks.includes(dateStr);
                                    
                                    return (
                                        <div className="relative">
                                            <button {...props} />
                                            {hasTask && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                                            )}
                                        </div>
                                    );
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg shadow-slate-100/50 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white overflow-hidden">
                    <CardContent className="p-8 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black font-jakarta">Resumen del Día</h3>
                            <p className="text-white/70 text-sm font-medium mt-1">
                                {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Selecciona una fecha"}
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-6">
                            <div>
                                <p className="text-3xl font-black">{appointments.length}</p>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Citas</p>
                            </div>
                            <div className="h-8 w-px bg-white/20" />
                            <div>
                                <p className="text-3xl font-black">
                                    {appointments.filter(a => a.status === "completed").length}
                                </p>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Listas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Appointment List */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight font-jakarta text-slate-800">
                            Citas y Tareas
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {appointments.length === 0 
                                ? "No hay eventos programados para este día." 
                                : `Tienes ${appointments.length} eventos programados.`}
                        </p>
                    </div>
                    <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                        <Plus className="h-5 w-5" />
                        Nueva Cita
                    </Button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                            <p className="font-bold">Cargando agenda...</p>
                        </div>
                    ) : appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <Card key={appointment.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl group overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-100/50">
                                <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
                                    <div className="w-full md:w-32 bg-slate-50 flex flex-col items-center justify-center py-6 px-4 shrink-0 transition-colors group-hover:bg-purple-50">
                                        <p className="text-xl font-black text-slate-800">
                                            {format(parseISO(appointment.due_date), "HH:mm")}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {format(parseISO(appointment.due_date), "aaa")}
                                        </p>
                                    </div>
                                    <div className="flex-1 p-6 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                        appointment.status === "completed" 
                                                            ? "bg-emerald-100 text-emerald-700" 
                                                            : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {appointment.status === "completed" ? "Completada" : "Pendiente"}
                                                    </span>
                                                    <h4 className="text-base font-bold text-slate-800 truncate">
                                                        {appointment.title}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-jakarta">
                                                        <User className="h-3.5 w-3.5 text-purple-500" />
                                                        {appointment.patients?.name || "Sin cliente"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                        {format(parseISO(appointment.due_date), "d 'de' MMM", { locale: es })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        {appointment.description && (
                                            <p className="text-sm text-slate-500 mt-4 leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4">
                                                "{appointment.description}"
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-bold text-slate-400">Día libre</p>
                            <p className="text-sm text-slate-400 mt-1">Disfruta de tu tiempo o programa algo nuevo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
