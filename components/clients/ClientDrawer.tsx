"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    X, 
    Mail, 
    Phone, 
    Globe, 
    Tag, 
    Briefcase, 
    TrendingUp, 
    Clock, 
    MessageSquare,
    CheckSquare,
    CalendarPlus,
    Loader2,
    ArrowRight,
    MessageCircle,
    Edit2,
    Save,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClientAction } from "@/app/actions/leads";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

// Sub-components
import { StageProgress } from "./StageProgress";
import { ActivityFeed } from "./ActivityFeed";
import { NoteSheet } from "./NoteSheet";
import { TaskDialog } from "./TaskDialog";
import { AppointmentDialog } from "./AppointmentDialog";

interface ClientDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string | null;
}

export function ClientDrawer({ open, onOpenChange, clientId }: ClientDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    const fetchClient = useCallback(async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
        if (data && !error) {
            setClient(data);
            setEditForm(data);
        }
        setLoading(false);
    }, []);

    const handleSave = async () => {
        if (!clientId) return;
        setSaving(true);
        try {
            const numericBudget = Number(String(editForm.estimated_budget || "").replace(/[^0-9.]/g, "")) || 0;
            const result = await updateClientAction(clientId, {
                ...editForm,
                project_value: numericBudget
            });
            if (result.success) {
                setClient(editForm);
                setIsEditing(false);
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error("Save Error:", err);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (open && clientId) {
            fetchClient(clientId);
        } else {
            setClient(null);
            setIsEditing(false);
        }
    }, [open, clientId, fetchClient]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1100px] w-[95vw] h-[85vh] p-0 overflow-hidden border-none rounded-[22px] shadow-2xl bg-white focus:outline-none">
                <div className="flex h-full">
                    {/* LEFT COLUMN: CLIENT INFO (40%) */}
                    <div className="w-[400px] border-r border-border-primary bg-[#fafaf9] flex flex-col shrink-0 overflow-y-auto">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-orange-primary" />
                            </div>
                        ) : client ? (
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-8 pb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-orange-light">
                                            <AvatarFallback className="bg-orange-light text-orange-primary font-black text-xl">
                                                {client.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <DialogTitle className="text-[20px] font-bold text-text-main truncate leading-tight">
                                                {client.name}
                                            </DialogTitle>
                                            <span className="text-[11px] font-bold text-orange-primary bg-orange-light px-2.5 py-1 rounded-md self-start mt-1.5 uppercase tracking-wider">
                                                {client.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-8">
                                        <button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold transition-all shadow-sm",
                                                isEditing ? "bg-slate-100 text-slate-600" : "bg-white border border-border-primary text-text-secondary hover:bg-orange-light hover:text-orange-primary"
                                            )}
                                        >
                                            {isEditing ? <RotateCcw className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                            {isEditing ? "Cancelar" : "Editar Perfil"}
                                        </button>
                                        
                                        {isEditing ? (
                                            <button 
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-primary text-white text-[12px] font-black shadow-lg hover:shadow-orange-primary/20 transition-all disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                Guardar
                                            </button>
                                        ) : (
                                            <QuickAction icon={Phone} label="Llamar" color="text-green-600 bg-green-50/50 border border-green-100" />
                                        )}
                                    </div>
                                </div>

                                {/* Content Sections */}
                                <div className="p-8 pt-4 space-y-8 pb-20">
                                    {/* Contact Section */}
                                    <div>
                                        <h3 className="text-[11px] font-black text-text-placeholder uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5" /> Información de Contacto
                                        </h3>
                                        <div className="space-y-6">
                                            {isEditing ? (
                                                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Nombre Completo</Label>
                                                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-12 text-[14px] rounded-xl border-border-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Teléfono</Label>
                                                        <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="h-12 text-[14px] rounded-xl border-border-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Email</Label>
                                                        <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-12 text-[14px] rounded-xl border-border-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Fuente</Label>
                                                        <Select value={editForm.source} onValueChange={val => setEditForm({...editForm, source: val})}>
                                                            <SelectTrigger className="h-12 text-[14px] rounded-xl border-border-primary">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Instagram">Instagram</SelectItem>
                                                                <SelectItem value="Facebook">Facebook</SelectItem>
                                                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                                                <SelectItem value="Website Form">Website Form</SelectItem>
                                                                <SelectItem value="Directo">Directo</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    <InfoItem icon={Phone} label="Teléfono" value={client.phone || "—"} />
                                                    <InfoItem icon={Mail} label="Email" value={client.email || "—"} />
                                                    <InfoItem icon={Globe} label="País" value={client.country || "—"} />
                                                    <InfoItem icon={MessageCircle} label="Fuente de Lead" value={client.source || client.lead_source || "Directo"} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project Section */}
                                    <div className="bg-white border border-border-primary rounded-2xl p-6 shadow-sm space-y-6">
                                        <h3 className="text-[11px] font-black text-text-placeholder uppercase tracking-[0.15em] flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" /> Detalles del Proyecto
                                        </h3>
                                        <div className="space-y-6">
                                            {isEditing ? (
                                                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Servicio</Label>
                                                        <Input value={editForm.service} onChange={e => setEditForm({...editForm, service: e.target.value})} className="h-12 text-[14px] rounded-xl border-border-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Presupuesto ($)</Label>
                                                        <Input value={editForm.estimated_budget} onChange={e => setEditForm({...editForm, estimated_budget: e.target.value})} className="h-12 text-[14px] rounded-xl border-border-primary" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[11px] font-bold text-text-placeholder uppercase ml-1">Descripción</Label>
                                                        <textarea 
                                                            value={editForm.project_description || ""} 
                                                            onChange={e => setEditForm({...editForm, project_description: e.target.value})}
                                                            className="w-full min-h-[100px] p-4 text-[14px] rounded-xl border border-border-primary focus:ring-2 focus:ring-orange-primary/20 focus:outline-none transition-all resize-none"
                                                            placeholder="Detalles sobre el proyecto..."
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1.5">
                                                            <p className="text-[11px] text-text-placeholder font-black uppercase tracking-wider">Servicio Interesado</p>
                                                            <p className="text-[15px] font-bold text-text-main">{client.service || "—"}</p>
                                                        </div>
                                                        <div className="text-right space-y-1.5">
                                                            <p className="text-[11px] text-text-placeholder font-black uppercase tracking-wider">Presupuesto</p>
                                                            <p className="text-[16px] font-black text-orange-primary">{client.estimated_budget || "—"}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {client.project_description && (
                                                        <div className="pt-4 border-t border-border-primary/50">
                                                            <p className="text-[11px] text-text-placeholder font-black uppercase tracking-wider mb-2">Descripción</p>
                                                            <p className="text-[13px] text-text-secondary leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-border-primary/50 italic">
                                                                "{client.project_description}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pipeline Section */}
                                    <div>
                                        <h3 className="text-[11px] font-black text-text-placeholder uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" /> Pipeline Progress
                                        </h3>
                                        <StageProgress 
                                            clientId={client.id} 
                                            currentStage={client.status} 
                                            onStageChange={(newStage) => setClient({ ...client, status: newStage })} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* RIGHT COLUMN: ACTIVITY FEED (60%) */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                        {/* Header actions */}
                        <div className="p-6 border-b border-border-primary flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black text-text-placeholder uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Historial de Actividad
                                </h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <NoteSheet clientId={clientId!} trigger={
                                    <Button className="h-9 px-5 rounded-xl bg-orange-primary text-white text-[11px] font-bold hover:bg-orange-dark shadow-md transition-all">
                                        + Nota
                                    </Button>
                                } />
                                <TaskDialog clientId={clientId!} clientName={client?.name} trigger={
                                    <Button variant="outline" className="h-9 px-5 rounded-xl border-border-primary text-text-secondary text-[11px] font-bold hover:bg-orange-light hover:border-orange-primary/30 transition-all">
                                        + Tarea
                                    </Button>
                                } />
                                <AppointmentDialog clientId={clientId!} clientName={client?.name} trigger={
                                    <Button variant="outline" className="h-9 px-5 rounded-xl border-border-primary text-text-secondary text-[11px] font-bold hover:bg-orange-light hover:border-orange-primary/30 transition-all">
                                        + Cita
                                    </Button>
                                } />
                            </div>
                        </div>

                        {/* Feed */}
                        <div className="flex-1 overflow-y-auto">
                            {clientId && <ActivityFeed clientId={clientId} />}
                        </div>
                        
                        {/* Close button inside dialog */}
                        <button 
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-text-placeholder hover:text-text-main transition-all z-50 hover:bg-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white rounded-lg border border-border-primary/50 shadow-sm">
                <Icon className="h-4.5 w-4.5 text-text-placeholder" />
            </div>
            <div className="space-y-1 min-w-0">
                <p className="text-[11px] text-text-placeholder font-black uppercase leading-none tracking-widest">{label}</p>
                <p className="text-[15px] font-bold text-text-main truncate">{value}</p>
            </div>
        </div>
    );
}

function QuickAction({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <button className={cn(
            "flex flex-col items-center justify-center py-3 rounded-2xl gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border shadow-sm",
            color
        )}>
            <Icon className="h-4.5 w-4.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
