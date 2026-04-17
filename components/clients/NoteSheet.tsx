"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageSquare, Send, Loader2 } from "lucide-react";

interface NoteSheetProps {
  clientId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function NoteSheet({ clientId, onSuccess, trigger }: NoteSheetProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email || "Usuario";

      const { error } = await supabase.from("client_notes").insert({
        client_id: clientId,
        type: "note",
        content: note.trim(),
        user_name: userName,
        metadata: {}
      });

      if (error) throw error;

      // Update last_contact_at
      await supabase.from("clients").update({ last_contact_at: new Date().toISOString() }).eq("id", clientId);

      setNote("");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-xl font-bold border-slate-100 hover:bg-purple-50 hover:text-purple-600 transition-all">
            <MessageSquare className="h-4 w-4" />
            Nueva Nota
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md border-l-0 shadow-2xl p-0 flex flex-col">
        <div className="p-8 bg-purple-600 text-white shrink-0">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white text-2xl font-black tracking-tight">Agregar Nota</SheetTitle>
            <SheetDescription className="text-purple-100 font-medium">
              Escribe un resumen de la interacción con el cliente para el historial.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contenido de la nota</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: El cliente está interesado en el Plan Starter pero quiere ver un demo primero..."
              className="min-h-[200px] rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-purple-200 resize-none font-medium text-slate-700"
              autoFocus
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !note.trim()} 
            className="w-full h-14 rounded-2xl bg-purple-600 text-white font-black text-lg shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all gap-3"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {loading ? "Guardando..." : "Guardar Nota"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
