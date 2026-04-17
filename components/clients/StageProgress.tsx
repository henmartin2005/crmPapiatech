"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STAGES = [
  { id: "NEW", label: "NEW LEAD" },
  { id: "CONTACTED", label: "CONVERSATION" },
  { id: "PROPOSAL_SENT", label: "PROPOSAL" },
  { id: "PAYMENT_INITIAL", label: "INITIAL PAYMENT" },
  { id: "ACTIVE", label: "TREATMENT" },
  { id: "INACTIVE", label: "INACTIVE" },
];

interface StageProgressProps {
  clientId: string;
  currentStage: string;
  onStageChange: (newStage: string) => void;
}

export function StageProgress({ clientId, currentStage, onStageChange }: StageProgressProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<typeof STAGES[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  const handleStageClick = (stage: typeof STAGES[0]) => {
    if (stage.id === currentStage) return;
    setPendingStage(stage);
    setConfirmOpen(true);
  };

  const confirmMove = async () => {
    if (!pendingStage) return;
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email || "Usuario";

      // 1. Update client
      const { error: updateError } = await supabase
        .from("clients")
        .update({ 
          status: pendingStage.id, 
          updated_at: new Date().toISOString(),
          last_contact_at: new Date().toISOString()
        })
        .eq("id", clientId);

      if (updateError) throw updateError;

      // 2. Insert activity note
      const oldStageLabel = STAGES.find(s => s.id === currentStage)?.label || currentStage;
      await supabase.from("client_notes").insert({
        client_id: clientId,
        type: "stage_change",
        content: `Stage cambiado de ${oldStageLabel} a ${pendingStage.label}`,
        user_name: userName,
        metadata: { from: currentStage, to: pendingStage.id }
      });

      onStageChange(pendingStage.id);
    } catch (error) {
      console.error("Error moving stage:", error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingStage(null);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Pipeline Progress</h4>
      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100" />
        
        <div className="space-y-4 relative">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div
                key={stage.id}
                onClick={() => !loading && handleStageClick(stage)}
                className={cn(
                  "flex items-center gap-4 group cursor-pointer transition-all duration-200",
                  isCurrent ? "scale-[1.02]" : "hover:translate-x-1"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                  isCurrent ? "border-purple-600 text-purple-600 ring-4 ring-purple-50 shadow-md" :
                  "border-slate-200 text-slate-300 group-hover:border-purple-300 group-hover:text-purple-300"
                )}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : 
                   isCurrent ? <Circle className="h-2 w-2 fill-current" /> :
                   <Circle className="h-2 w-2" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-[11px] font-bold tracking-tight uppercase transition-colors",
                    isCurrent ? "text-purple-600" :
                    isCompleted ? "text-slate-500" :
                    "text-slate-400 group-hover:text-slate-600"
                  )}>
                    {stage.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black tracking-tight">¿Mover cliente a {pendingStage?.label}?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              Esta acción quedará registrada en el historial de actividad y actualizará la posición del cliente en el Kanban.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-100 text-slate-500">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmMove(); }} 
              disabled={loading}
              className="rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200"
            >
              {loading ? "Actualizando..." : "Confirmar Movimiento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
