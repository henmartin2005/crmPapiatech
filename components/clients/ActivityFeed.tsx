"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
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
  note: { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
  stage_change: { icon: ArrowRightLeft, color: "text-blue-600", bg: "bg-blue-100" },
  task_created: { icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-100" },
  appointment_created: { icon: CalendarPlus, color: "text-orange-600", bg: "bg-orange-100" },
  email_sent: { icon: Mail, color: "text-teal-600", bg: "bg-teal-100" },
};

export function ActivityFeed({ clientId }: { clientId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (!error) {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel(`client_activity_${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_notes",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600 opacity-50" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-slate-200" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin actividad aún</p>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px] font-medium leading-relaxed">
          Agrega una nota o crea una tarea para comenzar el seguimiento cronológico.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
      {activities.map((activity, index) => {
        const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.note;
        const Icon = config.icon;

        return (
          <div key={activity.id} className="relative flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-[1px] bg-slate-100" />
            )}
            
            <div className="shrink-0 relative z-10 mt-1">
              <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center shadow-sm", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  {activity.user_name || "Sistema"} · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group hover:border-purple-100 transition-colors">
                <p className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap font-medium",
                  activity.type === "note" ? "text-slate-700" : "text-slate-500 italic"
                )}>
                  {activity.content}
                </p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && activity.type === "appointment_created" && (
                  <div className="mt-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block uppercase tracking-wide">
                    {activity.metadata.datetime ? new Date(activity.metadata.datetime).toLocaleString("es-ES") : ""}
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
