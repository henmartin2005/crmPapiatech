"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
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

interface StageProgressProps {
  clientId: string;
  currentStage: string;
  onStageChange: (newStage: string) => void;
}

export function StageProgress({ clientId, currentStage, onStageChange }: StageProgressProps) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPipelines = async () => {
        const { data } = await supabase.from("pipelines").select("*").order("position", { ascending: true });
        if (data) setPipelines(data);
    };
    fetchPipelines();
  }, []);

  const currentIndex = pipelines.findIndex((s) => s.name === currentStage);

  const handleStageClick = (stage: any) => {
    if (stage.name === currentStage) return;
    setPendingStage(stage);
    setConfirmOpen(true);
  };

  const confirmMove = async () => {
    if (!pendingStage) return;
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData.user?.user_metadata?.full_name || userData.user?.email || "Usuario";

      // 1. Update client - NOTE: field is 'stage' per v2 prompt schema
      const { error: updateError } = await supabase
        .from("clients")
        .update({ 
          status: pendingStage.name, 
          updated_at: new Date().toISOString(),
          last_contact_at: new Date().toISOString()
        })
        .eq("id", clientId);

      if (updateError) throw updateError;

      // 2. Insert activity note
      await supabase.from("client_notes").insert({
        client_id: clientId,
        type: "stage_change",
        content: `Movido de ${currentStage} a ${pendingStage.name}`,
        user_name: userName,
        metadata: { from: currentStage, to: pendingStage.name }
      });

      onStageChange(pendingStage.name);
    } catch (error) {
      console.error("Error moving stage:", error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingStage(null);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border-primary" />
        
        <div className="space-y-6 relative">
          {pipelines.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div
                key={stage.id}
                onClick={() => !loading && handleStageClick(stage)}
                className={cn(
                  "flex items-center gap-4 group cursor-pointer transition-all duration-200",
                  isCurrent && "translate-x-1"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                  isCompleted ? "bg-success text-white shadow-sm" :
                  isCurrent ? "bg-orange-primary shadow-[0_0_10px_rgba(234,88,12,0.4)]" :
                  "bg-white border-2 border-border-primary text-text-placeholder group-hover:border-orange-primary/30"
                )}>
                  {isCompleted ? <Check className="h-2.5 w-2.5" /> : 
                   isCurrent ? <div className="h-1.5 w-1.5 bg-white rounded-full" /> :
                   null}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-[10.5px] font-semibold tracking-tight transition-colors",
                    isCurrent ? "text-orange-primary" :
                    isCompleted ? "text-text-secondary" :
                    "text-text-placeholder group-hover:text-text-secondary"
                  )}>
                    {stage.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-[22px] border-border-primary shadow-2xl bg-white max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold tracking-tight text-text-main">¿Confirmar cambio?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-text-secondary pt-1">
              Moverás este cliente a <strong>{pendingStage?.name}</strong>. Esto se registrará en el feed de actividad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <AlertDialogCancel className="h-9 rounded-xl text-[11px] font-semibold flex-1 mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmMove(); }} 
              disabled={loading}
              className="h-9 rounded-xl bg-orange-primary text-white text-[11px] font-semibold flex-1"
            >
              {loading ? "..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
