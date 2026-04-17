"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckSquare, Loader2, Calendar } from "lucide-react";

interface TaskDialogProps {
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function TaskDialog({ clientId, clientName, onSuccess, trigger }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) return;
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email || "Usuario";

      // 1. Create the task
      const { error: taskError } = await supabase.from("client_tasks").insert({
        client_id: clientId,
        title: title.trim(),
        description: description.trim(),
        due_date: new Date(dueDate).toISOString(),
        created_by: userId,
        status: "pending"
      });

      if (taskError) throw taskError;

      // 2. Log in activity feed
      await supabase.from("client_notes").insert({
        client_id: clientId,
        type: "task_created",
        content: `Tarea creada: "${title}" - Vence el ${new Date(dueDate).toLocaleDateString("es-ES")}`,
        user_name: userName,
        metadata: { title, due_date: dueDate }
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-xl font-bold border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <CheckSquare className="h-4 w-4" />
            Nueva Tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-emerald-600 p-6 text-white text-center">
            <DialogHeader>
                <DialogTitle className="text-white text-xl font-black uppercase tracking-tight">Nueva Tarea</DialogTitle>
                <DialogDescription className="text-emerald-100 font-medium">
                    Asigna un pendiente para el cliente {clientName}
                </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Título de la tarea</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ej: Enviar contrato firmado..." 
              className="h-11 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-emerald-200 font-bold text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha de vencimiento</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                <Input 
                  type="datetime-local"
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="h-11 pl-10 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-emerald-200 font-bold text-slate-700"
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Descripción (Opcional)</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Detalles adicionales sobre lo que se debe hacer..." 
              className="min-h-[100px] rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-emerald-200 resize-none font-medium text-slate-600"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !title.trim() || !dueDate} 
            className="w-full h-12 mt-4 rounded-xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
            {loading ? "Creando..." : "Crear Tarea"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
