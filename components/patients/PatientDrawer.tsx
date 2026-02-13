"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, MessageSquare, Phone, Clock, User, Globe, Tag, Instagram, Facebook, MessageCircle } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface PatientDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string | null;
}

export function PatientDrawer({ open, onOpenChange, patientId }: PatientDrawerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [patient, setPatient] = useState({
        id: "",
        name: "",
        email: "",
        phone: "",
        country: "",
        source: "WhatsApp",
        service: "General",
        status: "NEW",
        notes: "",
        auto_followup: false,
    });

    useEffect(() => {
        if (!open) return;

        async function fetchPatient() {
            if (patientId) {
                setLoading(true);
                const { data, error } = await supabase
                    .from("patients")
                    .select("*")
                    .eq("id", patientId)
                    .single();

                if (data && !error) {
                    setPatient(data);
                }
                setLoading(false);
            } else {
                setPatient({
                    id: "",
                    name: "",
                    email: "",
                    phone: "",
                    country: "",
                    source: "WhatsApp",
                    service: "General",
                    status: "NEW",
                    notes: "",
                    auto_followup: false,
                });
            }
        }
        fetchPatient();
    }, [open, patientId]);

    const handleSave = async () => {
        if (!patient.name) return;

        setLoading(true);
        const { error } = await supabase.from("patients").upsert({
            ...(patient.id ? { id: patient.id } : {}),
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            country: patient.country,
            source: patient.source,
            service: patient.service,
            notes: patient.notes,
            auto_followup: patient.auto_followup,
            status: patient.status || "NEW",
            updated_at: new Date().toISOString(),
        });

        setLoading(false);
        if (!error) {
            onOpenChange(false);
            router.refresh();
        } else {
            console.error("Error saving patient:", error);
            alert("Error al guardar el cliente: " + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 bg-slate-50/95 backdrop-blur-xl">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 pb-32 -mb-28 text-white">
                    <DialogHeader>
                        <div className="flex items-center gap-5 mb-4">
                            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-2xl">
                                <AvatarFallback className="bg-white/10 text-white text-2xl font-black">
                                    {patient.name?.charAt(0) || "C"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-3xl font-black font-outfit tracking-tight">
                                    {patientId ? "Edit Client" : "New Client"}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-purple-100/80">
                                    Update information and track lead progress.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 pt-0 relative z-10">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-sm p-1 rounded-2xl h-12 shadow-inner">
                            <TabsTrigger value="info" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-slate-600 data-[state=active]:text-purple-700 transition-all">Client Information</TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-slate-600 data-[state=active]:text-purple-700 transition-all">Activity & Tracking</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-purple-500 transition-colors">
                                            <User className="h-full w-full" />
                                        </div>
                                        <Input
                                            value={patient.name}
                                            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                            className="pl-11 h-12 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 transition-all placeholder:text-slate-300 font-semibold"
                                            placeholder="Client Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Lead Source (Origen)</Label>
                                    <Select
                                        value={patient.source}
                                        onValueChange={(val) => setPatient({ ...patient, source: val })}
                                    >
                                        <SelectTrigger className="h-12 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-200 transition-all font-semibold text-slate-700">
                                            <div className="flex items-center gap-2">
                                                {patient.source === "WhatsApp" && <MessageCircle className="h-4 w-4 text-green-500" />}
                                                {patient.source === "Instagram" && <Instagram className="h-4 w-4 text-pink-500" />}
                                                {patient.source === "Facebook" && <Facebook className="h-4 w-4 text-blue-600" />}
                                                {patient.source === "Other" && <Tag className="h-4 w-4 text-slate-400" />}
                                                <SelectValue placeholder="Seleccionar origen" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                                            <SelectItem value="WhatsApp" className="rounded-xl focus:bg-green-50 focus:text-green-700 font-semibold">WhatsApp</SelectItem>
                                            <SelectItem value="Instagram" className="rounded-xl focus:bg-pink-50 focus:text-pink-700 font-semibold">Instagram</SelectItem>
                                            <SelectItem value="Facebook" className="rounded-xl focus:bg-blue-50 focus:text-blue-700 font-semibold">Facebook</SelectItem>
                                            <SelectItem value="Other" className="rounded-xl font-semibold">Otro / Recomendado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Number</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                                        <Input
                                            value={patient.phone}
                                            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                                            className="pl-11 h-12 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 transition-all font-semibold"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                                        <Input
                                            value={patient.email}
                                            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                                            className="pl-11 h-12 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 transition-all font-semibold"
                                            placeholder="client@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Country / Location</Label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                                        <Input
                                            value={patient.country}
                                            onChange={(e) => setPatient({ ...patient, country: e.target.value })}
                                            className="pl-11 h-12 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 transition-all font-semibold"
                                            placeholder="Example: Miami, FL"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-10" />

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Notes & Consultation Details</Label>
                                <Textarea
                                    value={patient.notes}
                                    onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                    className="min-h-[120px] bg-white border-none rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-purple-200 transition-all p-4 font-medium"
                                    placeholder="Add any additional details about this client's request or history..."
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={loading || !patient.name}
                                    className="h-14 px-10 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Client Information"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                                <div className="space-y-1">
                                    <Label className="text-base font-black text-purple-900">Automatic Follow-up</Label>
                                    <div className="text-xs text-purple-600/70 font-semibold tracking-tight">Send automatic re-engagement messages every 7 days</div>
                                </div>
                                <Switch checked={patient.auto_followup} onCheckedChange={(val) => setPatient({ ...patient, auto_followup: val })} className="data-[state=checked]:bg-purple-600" />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 ml-1">Lead Roadmap Checklist</h4>
                                <div className="grid grid-cols-1 gap-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
                                    {[
                                        { id: "c1", label: "Initial conversation completed" },
                                        { id: "c2", label: "Budget / Proposal sent" },
                                        { id: "c3", label: "Follow-up call scheduled" },
                                        { id: "c4", label: "Initial payment received" }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-xl transition-all group cursor-pointer">
                                            <Checkbox id={item.id} className="h-5 w-5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-md" />
                                            <label htmlFor={item.id} className="text-sm font-bold text-slate-600 leading-none cursor-pointer group-hover:text-purple-700 transition-colors">
                                                {item.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
