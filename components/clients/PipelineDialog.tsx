"use client";

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Kanban, Wand2 } from "lucide-react";

const PRESET_COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"];

export function PipelineDialog({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get last position
            const { data: lastPipe } = await supabase
                .from("pipelines")
                .select("position")
                .order("position", { ascending: false })
                .limit(1);
            
            const nextPos = (lastPipe?.[0]?.position ?? 0) + 1;

            const { error } = await supabase.from("pipelines").insert([{
                name: name.toUpperCase(),
                color,
                position: nextPos
            }]);

            if (!error) {
                setOpen(false);
                setName("");
                setErrorMsg(null);
            } else {
                setErrorMsg(error.message || "Error al crear la etapa");
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] border-none rounded-[22px] p-0 overflow-hidden shadow-2xl bg-white focus:outline-none">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
                            <Kanban className="h-6 w-6 text-orange-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                            Nueva Etapa
                        </DialogTitle>
                        <p className="text-white/60 text-[11px] font-medium uppercase tracking-widest mt-1">
                            Organiza tu flujo de trabajo
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Nombre de la Etapa
                            </Label>
                            <Input 
                                required
                                autoFocus
                                placeholder="Ej. NEGOCIACIÓN"
                                className="h-12 rounded-xl border-border-primary font-bold uppercase tracking-wide focus-visible:ring-slate-900/10"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Color Distintivo
                            </Label>
                            <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? 'border-amber-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold uppercase tracking-tight border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl border-border-primary text-text-placeholder font-bold text-[11px] uppercase tracking-widest"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="flex-[2] h-12 rounded-xl bg-orange-primary hover:bg-orange-dark text-white font-black text-[12px] uppercase tracking-widest shadow-[0_4px_14px_rgba(234,88,12,0.3)] transition-all active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (
                                <span className="flex items-center gap-2">
                                    <Wand2 className="h-4 w-4" /> Crear Etapa
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
