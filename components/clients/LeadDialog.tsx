"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { createLeadAction } from "@/app/actions/leads";
import { Loader2, UserPlus, Phone, Mail, Briefcase, Globe } from "lucide-react";

export function LeadDialog({ trigger }: { trigger: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [debugLog, setDebugLog] = useState<string>("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        estimated_budget: "",
        source: "Instagram",
        status: "NEW LEAD"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            setErrorMsg("No hay una sesión activa. Por favor, refresca la página.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setDebugLog("⏳ Iniciando registro...");

        // Safety timeout to reset loading state after 15s if it hangs
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setErrorMsg("Tiempo de espera agotado. Verifica tu conexión.");
            }
        }, 15000);

        try {
            const cleanBudget = formData.estimated_budget.replace(/[^0-9.]/g, "");
            const numericBudget = Number(cleanBudget) || 0;

            setDebugLog("🚀 Enviando al servidor...");
            const result = await createLeadAction({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                service: formData.service,
                source: formData.source,
                status: formData.status,
                estimated_budget: formData.estimated_budget,
                project_value: numericBudget
            });

            if (result.success) {
                setDebugLog("✅ ¡Éxito!");
                router.refresh();
                setOpen(false);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    service: "",
                    estimated_budget: "",
                    source: "Instagram",
                    status: "NEW LEAD"
                });
            } else {
                console.error("Action Error:", result.error);
                setErrorMsg(result.error || "Error al guardar el prospecto");
                setDebugLog("❌ Error detectado");
            }
        } catch (err: any) {
            console.error("Submit Error:", err);
            setErrorMsg("Error de conexión con el servidor");
            setDebugLog("❌ Fallo de comunicación");
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none rounded-[22px] p-0 overflow-hidden shadow-2xl bg-white">
                <div className="bg-orange-primary p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                            Nuevo Prospecto
                        </DialogTitle>
                        <p className="text-white/80 text-[11px] font-medium uppercase tracking-widest mt-1">
                            Añade un cliente a tu pipeline
                        </p>
                    </div>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <UserPlus className="h-32 w-32 -mr-8 -mt-8" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Nombre Completo
                            </Label>
                            <div className="relative">
                                <Input 
                                    required
                                    placeholder="Ej. Juan Pérez"
                                    className="h-11 rounded-xl border-border-primary pl-10 focus-visible:ring-orange-primary/30"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder">
                                    <Globe className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Email
                            </Label>
                            <div className="relative">
                                <Input 
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    className="h-11 rounded-xl border-border-primary pl-10 focus-visible:ring-orange-primary/30"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder">
                                    <Mail className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Teléfono
                            </Label>
                            <div className="relative">
                                <Input 
                                    placeholder="+1 809..."
                                    className="h-11 rounded-xl border-border-primary pl-10 focus-visible:ring-orange-primary/30"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder">
                                    <Phone className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Servicio / Plan
                            </Label>
                            <div className="relative">
                                <Input 
                                    placeholder="Ej. InfoWeb Plan"
                                    className="h-11 rounded-xl border-border-primary pl-10 focus-visible:ring-orange-primary/30"
                                    value={formData.service}
                                    onChange={e => setFormData({...formData, service: e.target.value})}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Fuente
                            </Label>
                            <Select 
                                value={formData.source} 
                                onValueChange={val => setFormData({...formData, source: val})}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-border-primary">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                    <SelectItem value="Web">Pagina Web</SelectItem>
                                    <SelectItem value="Direct">Directo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-text-placeholder uppercase tracking-wider ml-1">
                                Presupuesto ($)
                            </Label>
                            <Input 
                                placeholder="Ej. 1500"
                                className="h-11 rounded-xl border-border-primary focus-visible:ring-orange-primary/30"
                                value={formData.estimated_budget}
                                onChange={e => setFormData({...formData, estimated_budget: e.target.value})}
                            />
                        </div>
                    </div>

                    {debugLog && !errorMsg && (
                        <p className="text-[9px] font-bold text-orange-primary/60 uppercase tracking-widest text-center animate-pulse">
                            {debugLog}
                        </p>
                    )}

                    {errorMsg && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <span className="font-bold text-xs">!</span>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">{errorMsg}</p>
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
                            className="flex-[2] h-12 rounded-xl bg-orange-primary hover:bg-orange-dark text-white font-black text-[12px] uppercase tracking-widest shadow-[0_4px_14px_rgba(234,88,12,0.3)]"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear Prospecto"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
