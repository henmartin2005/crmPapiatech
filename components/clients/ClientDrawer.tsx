"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Mail,
    Phone,
    User,
    Globe,
    Tag,
    Instagram,
    Facebook,
    MessageCircle,
    Loader2,
    Pencil,
    Save,
    Briefcase,
    TrendingUp,
    Clock,
    LayoutDashboard,
    Activity as ActivityIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// New Components
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
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [client, setClient] = useState({
        id: "", 
        name: "", 
        email: "", 
        phone: "", 
        country: "",
        source: "WhatsApp", 
        service: "InfoWeb Plan", 
        status: "NEW",
        notes: "", 
        auto_followup: false,
        product_service: "",
        social_media: "",
        estimated_budget: "",
        project_description: "",
        project_value: null as number | null,
    });

    const [editing, setEditing] = useState(false);

    const sourceIcons: Record<string, React.ReactNode> = {
        WhatsApp: <MessageCircle className="h-3.5 w-3.5 text-green-500" />,
        Instagram: <Instagram className="h-3.5 w-3.5 text-pink-500" />,
        Facebook: <Facebook className="h-3.5 w-3.5 text-blue-600" />,
        Other: <Tag className="h-3.5 w-3.5 text-slate-400" />,
    };

    const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
        NEW: { bg: "#3B82F6", label: "New Lead" },
        CONTACTED: { bg: "#F59E0B", label: "Conversation" },
        PROPOSAL_SENT: { bg: "#10B981", label: "Proposal" },
        PAYMENT_INITIAL: { bg: "#8B5CF6", label: "Initial Payment" },
        ACTIVE: { bg: "#EC4899", label: "Treatment" },
        INACTIVE: { bg: "#6B7280", label: "Inactive" },
    };

    const statusInfo = STATUS_COLORS[client.status] || STATUS_COLORS.NEW;

    const fetchClient = useCallback(async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
        if (data && !error) setClient(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!open) { setEditing(false); return; }
        if (clientId) {
            fetchClient(clientId);
            setEditing(false);
        } else {
            setClient({ 
                id: "", name: "", email: "", phone: "", country: "", source: "WhatsApp", service: "InfoWeb Plan", status: "NEW", notes: "", auto_followup: false,
                product_service: "", social_media: "", estimated_budget: "", project_description: "", project_value: null
            });
            setEditing(true);
        }
    }, [open, clientId, fetchClient]);

    const handleSave = async () => {
        if (!client.name) return;
        setLoading(true);
        const { error } = await supabase.from("clients").upsert({
            ...(client.id ? { id: client.id } : {}),
            name: client.name, 
            email: client.email, 
            phone: client.phone,
            country: client.country, 
            source: client.source, 
            service: client.service,
            notes: client.notes, 
            auto_followup: client.auto_followup,
            status: client.status || "NEW",
            product_service: client.product_service,
            social_media: client.social_media,
            estimated_budget: client.estimated_budget,
            project_description: client.project_description,
            project_value: client.project_value,
            updated_at: new Date().toISOString(),
        });
        setLoading(false);
        if (!error) { 
            setEditing(false); 
            if (!clientId) { onOpenChange(false); router.refresh(); }
            else { fetchClient(clientId); router.refresh(); }
        }
        else alert("Error: " + error.message);
    };

    const InfoRow = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | React.ReactNode; color?: string }) => (
        <div className="flex items-center gap-4 py-3 px-1 border-b border-slate-50 last:border-0 group">
            <div className={cn("shrink-0 p-2 rounded-xl bg-slate-50 transition-colors group-hover:bg-white group-hover:shadow-sm", color || "text-slate-400")}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</p>
                <div className="text-sm font-bold text-slate-700 truncate">{value || "—"}</div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1400px] w-[92vw] max-h-[95vh] overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-[0_32px_128px_rgba(0,0,0,0.15)] p-0 bg-white [&>button]:hidden flex flex-col">
                {/* Header Section */}
                <div className="px-10 py-8 text-white flex items-center justify-between shrink-0 relative overflow-hidden" style={{ backgroundColor: statusInfo.bg }}>
                    {/* Decorative gloss */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                    
                    <DialogHeader className="flex-1 z-10">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-[4px] border-white/30 shadow-2xl scale-110">
                                <AvatarFallback className="bg-white/20 text-white text-3xl font-black">
                                    {client.name?.charAt(0)?.toUpperCase() || "C"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4">
                                    {client.name || "New Lead"}
                                    <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm">
                                        {statusInfo.label}
                                    </div>
                                </DialogTitle>
                                <div className="flex items-center gap-6 text-white/80 text-sm font-bold">
                                    {client.phone && <span className="flex items-center gap-2">📞 {client.phone}</span>}
                                    {client.email && <span className="flex items-center gap-2">✉️ {client.email}</span>}
                                    {client.country && <span className="flex items-center gap-2">📍 {client.country}</span>}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="flex items-center gap-4 z-10">
                        {clientId && !editing && (
                            <Button 
                                onClick={() => setEditing(true)} 
                                variant="outline" 
                                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900 rounded-2xl font-black text-xs uppercase px-6 h-12 transition-all shadow-lg"
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        )}
                        <button onClick={() => onOpenChange(false)} className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center text-white/70 hover:text-white border border-white/10">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden bg-slate-50/30">
                    {/* ======= LEFT COLUMN: Data ======= */}
                    <div className="w-[380px] shrink-0 border-r border-slate-100 flex flex-col bg-white overflow-y-auto">
                        
                        {/* Section: MAIN INFO */}
                        <div className="px-8 py-8 space-y-8">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-600 mb-6 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Client Information
                                </h3>
                                
                                {!editing ? (
                                    <div className="bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
                                        <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={client.name} color="text-slate-600" />
                                        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={client.phone} color="text-green-600" />
                                        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={client.email} color="text-blue-600" />
                                        <InfoRow icon={<LayoutDashboard className="h-4 w-4" />} label="Source" value={<div className="flex items-center gap-2">{sourceIcons[client.source]} {client.source}</div>} color="text-orange-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name</Label><Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 focus-visible:ring-purple-200" /></div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Phone</Label><Input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 focus-visible:ring-purple-200" /></div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</Label><Input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 focus-visible:ring-purple-200" /></div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Lead Source</Label>
                                            <Select value={client.source} onValueChange={(val) => setClient({ ...client, source: val })}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 focus:ring-purple-200"><div className="flex items-center gap-2">{sourceIcons[client.source]}<SelectValue /></div></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl"><SelectItem value="WhatsApp">WhatsApp</SelectItem><SelectItem value="Instagram">Instagram</SelectItem><SelectItem value="Facebook">Facebook</SelectItem><SelectItem value="Other">Otro</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section: PROJECT DETAILS (From Web Form) */}
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Project Details
                                </h3>
                                
                                {!editing ? (
                                    <div className="bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100">
                                        <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Service Interested" value={client.service} color="text-blue-600" />
                                        <InfoRow icon={<TrendingUp className="h-4 w-4" />} label="Product/Service sold" value={client.product_service} color="text-emerald-600" />
                                        <InfoRow icon={<Instagram className="h-4 w-4" />} label="Social Media" value={client.social_media} color="text-pink-600" />
                                        <InfoRow icon={<span className="font-black text-xs">$</span>} label="Estimated Budget" value={client.estimated_budget} color="text-amber-600" />
                                        
                                        {client.project_description && (
                                            <div className="py-4 px-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Requirement Description</p>
                                                <div className="text-sm font-medium text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm leading-relaxed lowercase first-letter:uppercase">
                                                    {client.project_description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Service Interest</Label>
                                            <Select value={client.service} onValueChange={(val) => setClient({ ...client, service: val })}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 focus:ring-purple-200"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl">
                                                    <SelectItem value="InfoWeb Plan">InfoWeb Plan</SelectItem><SelectItem value="Starter Plan">Starter Plan</SelectItem>
                                                    <SelectItem value="Chat AI Agent">Chat AI Agent</SelectItem><SelectItem value="Sistema de Citas">Sistema de Citas</SelectItem>
                                                    <SelectItem value="CRM Customizado">CRM Customizado</SelectItem><SelectItem value="Refresh Plan">Refresh Plan</SelectItem>
                                                    <SelectItem value="Mantenimiento + Ads">Mantenimiento + Ads</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">What do they sell?</Label><Input value={client.product_service} onChange={(e) => setClient({ ...client, product_service: e.target.value })} className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4 placeholder:font-medium" placeholder="E.g. Shoes, Legal services..." /></div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Social Media Handle</Label><Input value={client.social_media} onChange={(e) => setClient({ ...client, social_media: e.target.value })} className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4" placeholder="@user or url" /></div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Budget Range</Label>
                                            <Select value={client.estimated_budget} onValueChange={(val) => setClient({ ...client, estimated_budget: val })}>
                                                <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-2xl font-bold px-4"><SelectValue placeholder="Select budget..." /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl">
                                                    <SelectItem value="< $500">&lt; $500</SelectItem>
                                                    <SelectItem value="$500 - $1,000">$500 - $1,000</SelectItem>
                                                    <SelectItem value="$1,000 - $3,000">$1,000 - $3,000</SelectItem>
                                                    <SelectItem value="$3,000+">$3,000+</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Requirement</Label><Textarea value={client.project_description} onChange={(e) => setClient({ ...client, project_description: e.target.value })} className="min-h-[120px] bg-slate-50 border-transparent rounded-2xl font-medium p-4 resize-none" placeholder="Details about the project..." /></div>
                                        
                                        <Button onClick={handleSave} disabled={loading || !client.name}
                                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-lg shadow-xl shadow-purple-100 hover:scale-[1.02] transition-all disabled:opacity-50 mt-4">
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Profile"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ======= MIDDLE COLUMN: Pipeline ======= */}
                    <div className="w-[280px] shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/20 px-8 py-8">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Pipeline
                        </h3>
                        
                        <StageProgress 
                            clientId={client.id} 
                            currentStage={client.status} 
                            onStageChange={(newStage) => setClient(prev => ({ ...prev, status: newStage }))} 
                        />

                        <div className="mt-auto bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Next Steps</p>
                            <div className="space-y-2">
                                <TaskDialog clientId={client.id} clientName={client.name} trigger={
                                    <Button className="w-full h-11 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none font-bold text-xs gap-2">
                                        <CheckSquare className="h-4 w-4" /> Add Task
                                    </Button>
                                } />
                                <AppointmentDialog clientId={client.id} clientName={client.name} trigger={
                                    <Button className="w-full h-11 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none font-bold text-xs gap-2">
                                        <CalendarPlus className="h-4 w-4" /> Schedule Call
                                    </Button>
                                } />
                            </div>
                        </div>
                    </div>

                    {/* ======= RIGHT COLUMN: Feed ======= */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        <div className="px-10 py-6 border-b border-slate-50 shrink-0 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-600 flex items-center gap-2">
                                <ActivityIcon className="h-4 w-4" /> Activity Feed
                            </h3>
                            
                            <NoteSheet clientId={client.id} trigger={
                                <Button className="h-10 px-6 rounded-2xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all">
                                    Quick Note
                                </Button>
                            } />
                        </div>

                        {clientId ? (
                            <ActivityFeed clientId={clientId} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-300">
                                <p className="font-bold uppercase tracking-widest text-xs">Save lead to start history</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
