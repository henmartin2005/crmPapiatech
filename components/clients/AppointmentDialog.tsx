"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarPlus, Loader2, Clock, Globe } from "lucide-react";

interface AppointmentDialogProps {
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AppointmentDialog({ clientId, clientName, onSuccess, trigger }: AppointmentDialogProps) {
  const [datetime, setDatetime] = useState("");
  const [location, setLocation] = useState("Google Meet");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!datetime) return;
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email || "Usuario";

      // 1. Create the appointment
      const { error: apptError } = await supabase.from("appointments").insert({
        client_id: clientId,
        start_time: new Date(datetime).toISOString(),
        title: `Cita con ${clientName}`,
        location: location,
        status: "scheduled",
        created_by: userId
      });

      if (apptError) throw apptError;

      // 2. Log in activity feed
      await supabase.from("client_notes").insert({
        client_id: clientId,
        type: "appointment_created",
        content: `Cita programada para el ${new Date(datetime).toLocaleString("es-ES")} en ${location}`,
        user_name: userName,
        metadata: { datetime, location }
      });

      // 3. Update last_contact_at
      await supabase.from("clients").update({ last_contact_at: new Date().toISOString() }).eq("id", clientId);

      setOpen(false);
      setDatetime("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-xl font-bold border-slate-100 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <CalendarPlus className="h-4 w-4" />
            Programar Cita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-orange-500 p-6 text-white text-center">
            <DialogHeader>
                <DialogTitle className="text-white text-xl font-black uppercase tracking-tight">Programar Cita</DialogTitle>
                <DialogDescription className="text-orange-100 font-medium">
                    Define fecha y lugar para la reunión con {clientName}
                </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha y Hora</label>
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                <Input 
                  type="datetime-local"
                  value={datetime} 
                  onChange={(e) => setDatetime(e.target.value)} 
                  className="h-11 pl-10 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-orange-200 font-bold text-slate-700"
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Lugar / Plataforma</label>
            <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Ej: Google Meet, Oficina, Llamada..." 
                  className="h-11 pl-10 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-orange-200 font-bold text-slate-700"
                />
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-4">
            <p className="text-[10px] text-blue-600 font-bold flex items-center gap-2">
                <Clock className="h-3 w-3" />
                RECORDATORIO
            </p>
            <p className="text-xs text-blue-700 mt-1 font-medium leading-relaxed">
                Esta cita se sincronizará automáticamente con el Calendario General del Dashboard.
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !datetime} 
            className="w-full h-12 rounded-xl bg-orange-500 text-white font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            {loading ? "Programando..." : "Programar Cita"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
