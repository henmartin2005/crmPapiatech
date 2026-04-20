"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
    MessageSquare, 
    ArrowRightLeft, 
    CheckSquare, 
    CalendarPlus, 
    Mail, 
    Loader2,
    Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type ActivityType = "note" | "stage_change" | "task_created" | "appointment_created" | "email_sent";

interface Activity {
    id: string;
    type: ActivityType;
    content: string;
    user_name: string;
    created_at: string;
    metadata?: any;
}

const TYPE_CONFIG: Record<ActivityType, { icon: any; color: string; bg: string }> = {
    note: { icon: MessageSquare, color: "text-orange-primary", bg: "bg-orange-light" },
    stage_change: { icon: ArrowRightLeft, color: "text-blue-600", bg: "bg-blue-50" },
    task_created: { icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    appointment_created: { icon: CalendarPlus, color: "text-amber-600", bg: "bg-amber-50" },
    email_sent: { icon: Mail, color: "text-teal-600", bg: "bg-teal-50" },
};

export function ActivityFeed({ clientId }: { clientId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        const { data } = await supabase
            .from("client_notes")
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false });
        
        if (data) setActivities(data as Activity[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchActivities();

        const channel = supabase.channel(`activity-${clientId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'client_notes',
                filter: `client_id=eq.${clientId}`
            }, (payload) => {
                setActivities(prev => [payload.new as Activity, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [clientId]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-orange-primary" />
        </div>
    );

    if (activities.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-3">
            <div className="h-12 w-12 bg-[#fafaf9] rounded-full flex items-center justify-center">
                <Inbox className="h-6 w-6 text-text-placeholder opacity-50" />
            </div>
            <p className="text-[11px] font-bold text-text-placeholder uppercase tracking-widest">Sin actividad aún</p>
            <p className="text-[10px] text-text-placeholder leading-relaxed max-w-[200px]">
                Registra notas, tareas o citas para ver el historial cronológico aquí.
            </p>
        </div>
    );

    return (
        <div className="px-8 py-6 space-y-8 pb-10">
            {activities.map((activity, i) => {
                const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note;
                const Icon = config.icon;
                
                return (
                    <div key={activity.id} className="relative flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Timeline line */}
                        {i !== activities.length - 1 && (
                            <div className="absolute left-[11px] top-7 bottom-[-32px] w-0.5 bg-border-primary" />
                        )}
                        
                        <div className="shrink-0 relative z-10">
                            <div className={cn("h-6 w-6 rounded-md flex items-center justify-center shadow-sm", config.bg)}>
                                <Icon className={cn("h-3.5 w-3.5", config.color)} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold uppercase tracking-tight text-text-placeholder">
                                    {activity.user_name || "Sistema"} · {formatDistanceToNow(new Date(activity.created_at), { locale: es })} ago
                                </p>
                            </div>
                            <div className="bg-[#f9fafb] rounded-[11px] p-4 border border-border-primary hover:border-orange-primary/20 transition-colors shadow-sm">
                                <p className={cn(
                                    "text-[11.5px] leading-relaxed whitespace-pre-wrap font-medium",
                                    activity.type === "note" ? "text-text-main" : "text-text-secondary italic"
                                )}>
                                    {activity.content}
                                </p>
                                
                                {activity.metadata?.datetime && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <CalendarPlus className="h-3 w-3 text-orange-primary" />
                                        <span className="text-[9px] font-bold text-orange-primary uppercase">
                                            {format(new Date(activity.metadata.datetime), "dd MMM, HH:mm", { locale: es })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
