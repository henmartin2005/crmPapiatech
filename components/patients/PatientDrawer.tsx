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
    MessageSquare,
    Phone,
    PhoneCall,
    Smartphone,
    Clock,
    User,
    Globe,
    Tag,
    Instagram,
    Facebook,
    MessageCircle,
    Send,
    ClipboardList,
    CalendarPlus,
    CheckCircle2,
    Circle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Save,
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
import { supabase } from "@/lib/supabase";

interface PatientDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string | null;
}

type Note = { id: string; content: string; created_at: string; created_by: string | null };
type Task = { id: string; title: string; description: string; due_date: string; status: string; created_at: string; completed_at: string | null };

export function PatientDrawer({ open, onOpenChange, patientId }: PatientDrawerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const notesEndRef = useRef<HTMLDivElement>(null);
    const noteInputRef = useRef<HTMLInputElement>(null);

    // Task expand & completion note
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [completingTask, setCompletingTask] = useState<Task | null>(null);
    const [completionNote, setCompletionNote] = useState("");

    const [patient, setPatient] = useState({
        id: "", name: "", email: "", phone: "", country: "",
        source: "WhatsApp", service: "InfoWeb Plan", status: "NEW",
        notes: "", auto_followup: false,
    });

    // Editing mode for client info
    const [editing, setEditing] = useState(false);

    // Notes
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [sendingNote, setSendingNote] = useState(false);

    // Tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // Task creation (Kommo-style)
    const [showTaskPicker, setShowTaskPicker] = useState(false);
    const [taskTitle, setTaskTitle] = useState("Follow-up");
    const [taskDescription, setTaskDescription] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState("09:00");
    const [allDay, setAllDay] = useState(true);
    const [savingTask, setSavingTask] = useState(false);
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [taskDueLabel, setTaskDueLabel] = useState("Mañana");

    const sourceIcons: Record<string, React.ReactNode> = {
        WhatsApp: <MessageCircle className="h-3.5 w-3.5 text-green-500" />,
        Instagram: <Instagram className="h-3.5 w-3.5 text-pink-500" />,
        Facebook: <Facebook className="h-3.5 w-3.5 text-blue-600" />,
        Other: <Tag className="h-3.5 w-3.5 text-slate-400" />,
    };

    // Status → column color mapping (matches Kanban)
    const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
        NEW: { bg: "#3B82F6", label: "New Lead" },
        CONTACTED: { bg: "#F59E0B", label: "Conversation" },
        PROPOSAL_SENT: { bg: "#10B981", label: "Proposal" },
        PAYMENT_INITIAL: { bg: "#8B5CF6", label: "Initial Payment" },
        ACTIVE: { bg: "#EC4899", label: "Treatment" },
        INACTIVE: { bg: "#6B7280", label: "Inactive" },
    };

    const statusInfo = STATUS_COLORS[patient.status] || STATUS_COLORS.NEW;

    const fetchNotes = useCallback(async (pid: string) => {
        setNotesLoading(true);
        const { data } = await supabase.from("client_notes").select("*").eq("patient_id", pid).order("created_at", { ascending: false });
        setNotes(data || []);
        setNotesLoading(false);
    }, []);

    const fetchTasks = useCallback(async (pid: string) => {
        setTasksLoading(true);
        const { data } = await supabase.from("client_tasks").select("*").eq("patient_id", pid).order("due_date", { ascending: true });
        setTasks(data || []);
        setTasksLoading(false);
    }, []);

    useEffect(() => {
        if (!open) { setShowTaskPicker(false); setEditing(false); return; }
        if (patientId) {
            setLoading(true);
            supabase.from("patients").select("*").eq("id", patientId).single().then(({ data, error }) => {
                if (data && !error) setPatient(data);
                setLoading(false);
            });
            fetchNotes(patientId);
            fetchTasks(patientId);
            setEditing(false);
        } else {
            setPatient({ id: "", name: "", email: "", phone: "", country: "", source: "WhatsApp", service: "InfoWeb Plan", status: "NEW", notes: "", auto_followup: false });
            setNotes([]); setTasks([]);
            setEditing(true); // new client = edit mode
        }
    }, [open, patientId, fetchNotes, fetchTasks]);

    // Auto-focus note input when opened with existing client
    useEffect(() => {
        if (open && patientId) {
            setTimeout(() => noteInputRef.current?.focus(), 400);
        }
    }, [open, patientId]);

    // No auto-scroll needed — newest notes appear at top

    // Predictive note icon based on content keywords
    const getNoteIcon = (content: string) => {
        const lower = content.toLowerCase();
        // Call-related keywords (ES + EN)
        const callKeywords = ["llame", "llamé", "llamo", "llamó", "llamada", "llamar", "contacto telefonico", "contacto telefónico", "hice una llamada", "hicimos una llamada", "llamamos", "call", "called", "calling", "phone call", "spoke on the phone", "hablamos por telefono", "hablamos por teléfono", "le marque", "le marqué"];
        // SMS/Message-related keywords (ES + EN)
        const smsKeywords = ["sms", "mensaje", "envie un mensaje", "envié un mensaje", "le escribi", "le escribí", "text", "texted", "message", "whatsapp", "le mande", "le mandé", "le envie", "le envié"];

        if (callKeywords.some(kw => lower.includes(kw))) {
            return { icon: <PhoneCall className="h-3 w-3 text-emerald-600" />, bg: "bg-emerald-100" };
        }
        if (smsKeywords.some(kw => lower.includes(kw))) {
            return { icon: <Smartphone className="h-3 w-3 text-blue-600" />, bg: "bg-blue-100" };
        }
        return { icon: <MessageSquare className="h-3 w-3 text-purple-500" />, bg: "bg-purple-100" };
    };

    const handleSave = async () => {
        if (!patient.name) return;
        setLoading(true);
        const { error } = await supabase.from("patients").upsert({
            ...(patient.id ? { id: patient.id } : {}),
            name: patient.name, email: patient.email, phone: patient.phone,
            country: patient.country, source: patient.source, service: patient.service,
            notes: patient.notes, auto_followup: patient.auto_followup,
            status: patient.status || "NEW", updated_at: new Date().toISOString(),
        });
        setLoading(false);
        if (!error) { setEditing(false); if (!patientId) { onOpenChange(false); router.refresh(); } else { router.refresh(); } }
        else alert("Error: " + error.message);
    };

    const handleSendNote = async () => {
        if (!newNote.trim() || !patientId) return;
        setSendingNote(true);
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("client_notes").insert({ patient_id: patientId, content: newNote.trim(), created_by: userData.user?.id || null });
        setNewNote("");
        await fetchNotes(patientId);
        setSendingNote(false);
    };

    const handleNoteKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendNote(); }
    };

    const handleToggleTask = async (task: Task) => {
        if (task.status === "pending") {
            // Opening completion flow — require a note
            setCompletingTask(task);
            setCompletionNote("");
        } else {
            // Re-open a completed task (no note required)
            await supabase.from("client_tasks").update({ status: "pending", completed_at: null }).eq("id", task.id);
            if (patientId) await fetchTasks(patientId);
        }
    };

    const handleCompleteWithNote = async () => {
        if (!completingTask || !completionNote.trim()) return;
        // Save the note
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("client_notes").insert({
            patient_id: patientId,
            content: `✅ Task completada: "${completingTask.title}" — ${completionNote.trim()}`,
            created_by: userData.user?.id || null,
        });
        // Mark task complete
        await supabase.from("client_tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", completingTask.id);
        setCompletingTask(null);
        setCompletionNote("");
        if (patientId) {
            await fetchTasks(patientId);
            await fetchNotes(patientId);
        }
    };

    // Quick date helpers
    const quickDates = [
        { label: "En 15 min", fn: () => { const d = new Date(); d.setMinutes(d.getMinutes() + 15); return d; } },
        { label: "En 30 min", fn: () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); return d; } },
        { label: "En 1 hora", fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); return d; } },
        { label: "Hoy", fn: () => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; } },
        { label: "Mañana", fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
        { label: "Esta semana", fn: () => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (5 - day)); d.setHours(9, 0, 0, 0); return d; } },
        { label: "En 7 días", fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d; } },
        { label: "En 30 días", fn: () => { const d = new Date(); d.setDate(d.getDate() + 30); d.setHours(9, 0, 0, 0); return d; } },
    ];

    const selectQuickDate = (fn: () => Date, label: string) => {
        const d = fn();
        setSelectedDate(d); setSelectedTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
        setTaskDueLabel(label); setAllDay(false); setCalMonth(d.getMonth()); setCalYear(d.getFullYear());
    };

    const selectCalendarDay = (day: number) => {
        const d = new Date(calYear, calMonth, day, 9, 0, 0);
        setSelectedDate(d); setSelectedTime("09:00");
        setTaskDueLabel(d.toLocaleDateString("es-ES", { month: "2-digit", day: "2-digit", year: "numeric" }));
    };

    const handleSetTask = async () => {
        if (!taskTitle.trim() || !selectedDate || !patientId) return;
        setSavingTask(true);
        const finalDate = new Date(selectedDate);
        if (!allDay) { const [h, m] = selectedTime.split(":").map(Number); finalDate.setHours(h, m, 0, 0); }
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("client_tasks").insert({ patient_id: patientId, title: taskTitle.trim(), description: taskDescription, due_date: finalDate.toISOString(), created_by: userData.user?.id || null });
        setShowTaskPicker(false); setTaskTitle("Follow-up"); setTaskDescription("");
        setSelectedDate(null); await fetchTasks(patientId); setSavingTask(false);
    };

    // Calendar grid
    const calDays = (() => {
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const arr: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) arr.push(null);
        for (let i = 1; i <= daysInMonth; i++) arr.push(i);
        return arr;
    })();

    const todayDate = new Date();
    const isCalToday = (day: number) => day === todayDate.getDate() && calMonth === todayDate.getMonth() && calYear === todayDate.getFullYear();
    const isCalSelected = (day: number) => selectedDate ? day === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear() : false;

    const timeSlots = ["8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM", "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM"];

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const formatDueDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("es-ES", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    // Inline display value helper
    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
        <div className="flex items-center gap-3 py-2.5 px-1 border-b border-slate-100 last:border-0">
            <div className="shrink-0 text-slate-400">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{value || "—"}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1600px] w-[88vw] max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl p-0 bg-white [&>button]:hidden flex flex-col">
                {/* Header — color matches kanban column */}
                <div className="px-7 py-5 text-white flex items-center justify-between transition-colors duration-300 shrink-0" style={{ backgroundColor: statusInfo.bg }}>
                    <DialogHeader className="flex-1">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
                                <AvatarFallback className="bg-white/20 text-white text-lg font-black">
                                    {patient.name?.charAt(0)?.toUpperCase() || "C"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                    {patient.name || "New Client"}
                                    <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {statusInfo.label}
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-white/70 text-xs font-medium mt-0.5">
                                    {patient.phone && <span className="mr-4">📞 {patient.phone}</span>}
                                    {patient.email && <span>✉️ {patient.email}</span>}
                                    {!patient.phone && !patient.email && "Client profile and activity"}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <button onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white">
                        ✕
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* ======= LEFT: Client Info ======= */}
                    <div className="w-[320px] shrink-0 border-r border-slate-100 flex flex-col bg-white">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Client Info</h3>
                            {patientId && (
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                    {editing ? <Save className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                                    {editing ? "Done" : "Edit"}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-3">
                            {!editing ? (
                                /* ---- READ-ONLY VIEW ---- */
                                <div className="space-y-0">
                                    <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={patient.name} />
                                    <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={patient.phone} />
                                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email} />
                                    <InfoRow icon={sourceIcons[patient.source] || <Tag className="h-4 w-4" />} label="Lead Source" value={patient.source} />
                                    <InfoRow icon={<Tag className="h-4 w-4" />} label="Service" value={patient.service} />
                                    <InfoRow icon={<Globe className="h-4 w-4" />} label="Country / Location" value={patient.country} />
                                    {patient.notes && (
                                        <div className="py-3 px-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Notes</p>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{patient.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ---- EDIT VIEW ---- */
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                        <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold" placeholder="Client Name" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</Label>
                                        <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold" placeholder="+1 234 567 890" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold" placeholder="client@example.com" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Source</Label>
                                        <Select value={patient.source} onValueChange={(val) => setPatient({ ...patient, source: val })}>
                                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold"><div className="flex items-center gap-2">{sourceIcons[patient.source]}<SelectValue /></div></SelectTrigger>
                                            <SelectContent className="rounded-lg"><SelectItem value="WhatsApp">WhatsApp</SelectItem><SelectItem value="Instagram">Instagram</SelectItem><SelectItem value="Facebook">Facebook</SelectItem><SelectItem value="Other">Otro</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service</Label>
                                        <Select value={patient.service} onValueChange={(val) => setPatient({ ...patient, service: val })}>
                                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-lg">
                                                <SelectItem value="InfoWeb Plan">InfoWeb Plan</SelectItem><SelectItem value="Starter Plan">Starter Plan</SelectItem>
                                                <SelectItem value="Chat AI Agent">Chat AI Agent</SelectItem><SelectItem value="Sistema de Citas">Sistema de Citas</SelectItem>
                                                <SelectItem value="CRM Customizado">CRM Customizado</SelectItem><SelectItem value="Refresh Plan">Refresh Plan</SelectItem>
                                                <SelectItem value="Mantenimiento + Ads">Mantenimiento + Ads</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Country / Location</Label>
                                        <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input value={patient.country} onChange={(e) => setPatient({ ...patient, country: e.target.value })} className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-semibold" placeholder="Miami, FL" /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</Label>
                                        <Textarea value={patient.notes} onChange={(e) => setPatient({ ...patient, notes: e.target.value })} className="min-h-[70px] bg-slate-50 border-slate-200 rounded-lg text-sm resize-none" placeholder="Client notes..." />
                                    </div>
                                    <Button onClick={handleSave} disabled={loading || !patient.name}
                                        className="w-full h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Pending tasks summary */}
                        {tasks.filter(t => t.status === "pending").length > 0 && (
                            <div className="px-5 py-3 border-t border-slate-100 bg-amber-50/50 shrink-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Pending Tasks</p>
                                <div className="space-y-1.5">
                                    {tasks.filter(t => t.status === "pending").slice(0, 4).map(t => (
                                        <div key={t.id} className="flex items-center gap-2">
                                            <button onClick={() => handleToggleTask(t)}><Circle className="h-3.5 w-3.5 text-amber-400 hover:text-emerald-500 transition-colors" /></button>
                                            <span className="text-xs font-medium text-slate-600 truncate flex-1">{t.title}</span>
                                            <span className="text-[10px] text-slate-400">{formatDueDate(t.due_date)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ======= RIGHT: Activity Feed ======= */}
                    <div className="flex-1 flex flex-col min-w-0 relative">
                        {/* Feed header */}
                        <div className="px-6 py-3 border-b border-slate-100 bg-white shrink-0 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                                Activity Feed
                            </h3>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {notes.length} notes · {tasks.length} tasks
                            </span>
                        </div>

                        {notesLoading || tasksLoading ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
                            </div>
                        ) : notes.length === 0 && tasks.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                                <MessageSquare className="h-14 w-14 mb-4 opacity-20" />
                                <p className="text-base font-bold text-slate-400">No activity yet</p>
                                <p className="text-sm text-slate-400 mt-1">Add a note or create a task to get started</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* ── PINNED: Pending Tasks (sticky top, amber bg) ── */}
                                {tasks.filter(t => t.status === "pending").length > 0 && (
                                    <div className="shrink-0 bg-amber-50/70 border-b border-amber-200/60 px-6 py-4 space-y-2.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Tasks</span>
                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-100 px-1.5 py-0.5 rounded-md">{tasks.filter(t => t.status === "pending").length}</span>
                                        </div>
                                        {tasks.filter(t => t.status === "pending").map((task) => {
                                            const isExpanded = expandedTaskId === task.id;
                                            const isOverdue = new Date(task.due_date) < new Date();
                                            return (
                                                <div key={`t-${task.id}`} className="flex gap-3 group">
                                                    <div className="shrink-0 mt-1">
                                                        <button onClick={() => handleToggleTask(task)} title="Completar tarea (requiere nota)">
                                                            <Circle className="h-5 w-5 text-amber-400 group-hover:text-emerald-500 transition-colors" />
                                                        </button>
                                                    </div>
                                                    <div
                                                        className={`flex-1 bg-white rounded-xl px-4 py-3 border shadow-sm cursor-pointer transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50/30" : "border-amber-200/50"}`}
                                                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <ClipboardList className={`h-3 w-3 ${isOverdue ? "text-red-500" : "text-amber-500"}`} />
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
                                                                    Task · {formatDueDate(task.due_date)}
                                                                    {isOverdue && " · OVERDUE"}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400">{isExpanded ? "▲" : "▼"}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-700">{task.title}</p>
                                                        {isExpanded && (
                                                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                                                                {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                                                                <p className="text-[10px] text-slate-400">
                                                                    Creada: {new Date(task.created_at).toLocaleString("es-ES")}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    Vence: {new Date(task.due_date).toLocaleString("es-ES")}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Completed tasks collapsed */}
                                        {tasks.filter(t => t.status === "completed").length > 0 && (
                                            <div className="flex items-center flex-wrap gap-2 pt-1">
                                                {tasks.filter(t => t.status === "completed").map((task) => (
                                                    <div key={`tc-${task.id}`} className="flex items-center gap-1.5 opacity-40">
                                                        <button onClick={() => handleToggleTask(task)}>
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        </button>
                                                        <span className="text-xs text-slate-400 line-through">{task.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Completion Note Modal (overlay) ── */}
                                {completingTask && (
                                    <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-6 py-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                                                Completar: {completingTask.title}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-emerald-600 mb-2 font-medium">
                                            Escribe una nota sobre la acción realizada antes de cerrar esta tarea:
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                value={completionNote}
                                                onChange={(e) => setCompletionNote(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter" && completionNote.trim()) handleCompleteWithNote(); }}
                                                placeholder="¿Qué hiciste? ej: Llamé al cliente y confirmó la cita..."
                                                className="flex-1 h-9 text-sm bg-white border-emerald-200 rounded-lg focus-visible:ring-emerald-300"
                                                autoFocus
                                            />
                                            <Button
                                                onClick={handleCompleteWithNote}
                                                disabled={!completionNote.trim()}
                                                size="sm"
                                                className="h-9 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm"
                                            >
                                                ✓ Completar
                                            </Button>
                                            <button
                                                onClick={() => setCompletingTask(null)}
                                                className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── SCROLLABLE: Notes (newest first, purple-tinted bg) ── */}
                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/50">
                                    {notes.length > 0 && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Notes</span>
                                            <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-md">{notes.length}</span>
                                        </div>
                                    )}
                                    {notes.map((note) => {
                                        const noteStyle = getNoteIcon(note.content);
                                        return (
                                            <div key={note.id} className="flex gap-3">
                                                <div className="shrink-0 mt-1">
                                                    <div className={`h-5 w-5 rounded-full ${noteStyle.bg} flex items-center justify-center`}>
                                                        {noteStyle.icon}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                                                        {formatDateTime(note.created_at)}
                                                    </span>
                                                    <div className="bg-white rounded-xl px-4 py-3 border border-purple-100/50 shadow-sm">
                                                        <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {notes.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-8">No notes yet. Write one below!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Note input bar */}
                        {patientId && (
                            <div className="border-t border-slate-200 px-6 py-3 flex gap-2 bg-white shrink-0">
                                <Input ref={noteInputRef} value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={handleNoteKeyDown}
                                    placeholder="Write a note..." disabled={sendingNote}
                                    className="flex-1 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-purple-200" />
                                <Button onClick={handleSendNote} disabled={sendingNote || !newNote.trim()} size="sm"
                                    className="h-10 w-10 rounded-lg bg-purple-600 text-white hover:bg-purple-700 p-0 shrink-0 shadow-sm">
                                    {sendingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}

                        {/* ======= TASK BAR (always visible) ======= */}
                        {patientId && (
                            <div className="border-t-2 border-slate-200 bg-white shrink-0 relative">
                                <div
                                    className="px-6 py-3 flex items-center gap-2 cursor-pointer hover:bg-blue-50/50 transition-colors"
                                    onClick={() => {
                                        if (!showTaskPicker) {
                                            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
                                            setSelectedDate(tomorrow); setTaskDueLabel("Mañana"); setCalMonth(tomorrow.getMonth()); setCalYear(tomorrow.getFullYear());
                                        }
                                        setShowTaskPicker(!showTaskPicker);
                                    }}
                                >
                                    <CalendarPlus className="h-4 w-4 text-blue-500 shrink-0" />
                                    <span className="text-sm truncate">
                                        <span className="text-blue-600 font-bold">Task</span>
                                        <span className="text-slate-400 mx-1">due</span>
                                        <span className="text-blue-600 font-bold">{taskDueLabel}</span>
                                        <span className="text-slate-400 mx-1.5">·</span>
                                        <span className="text-slate-400">{allDay ? "All day" : selectedTime}</span>
                                        <span className="text-slate-400 mx-1.5">·</span>
                                        <span className="text-slate-400">for</span>
                                        <span className="text-blue-600 font-bold ml-1">{patient.name || "Client"}</span>
                                        <span className="text-slate-300 mx-1.5">⊙</span>
                                        <span className="font-bold text-slate-600">{taskTitle}:</span>
                                        {taskDescription && <span className="text-slate-400 ml-1">{taskDescription}</span>}
                                    </span>
                                </div>

                                {/* Task Picker Popup */}
                                {showTaskPicker && (
                                    <div className="absolute bottom-full left-0 right-0 bg-white border border-slate-200 rounded-t-xl shadow-2xl z-50" style={{ animation: "slideUp 0.2s ease-out" }}>
                                        <div className="flex min-h-[300px]">
                                            {/* Quick dates */}
                                            <div className="w-[140px] border-r border-slate-100 py-2 shrink-0 bg-slate-50/50">
                                                {quickDates.map((qd) => (
                                                    <button key={qd.label} onClick={() => selectQuickDate(qd.fn, qd.label)}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${taskDueLabel === qd.label ? "bg-purple-50 text-purple-700 font-bold" : "text-slate-600 font-medium"}`}>
                                                        {qd.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mini Calendar */}
                                            <div className="w-[250px] border-r border-slate-100 p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                                                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"><ChevronLeft className="h-4 w-4 text-slate-500" /></button>
                                                    <span className="text-sm font-bold capitalize text-slate-700">
                                                        {new Date(calYear, calMonth).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                                                    </span>
                                                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                                                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"><ChevronRight className="h-4 w-4 text-slate-500" /></button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-0.5">
                                                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                                                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1.5">{d}</div>
                                                    ))}
                                                    {calDays.map((day, i) => (
                                                        <div key={i} className="flex items-center justify-center">
                                                            {day ? (
                                                                <button onClick={() => selectCalendarDay(day)}
                                                                    className={`h-8 w-8 text-xs font-medium rounded-full transition-all ${isCalSelected(day) ? "bg-purple-600 text-white font-bold shadow-md"
                                                                        : isCalToday(day) ? "bg-purple-100 text-purple-700 font-bold"
                                                                            : "hover:bg-slate-100 text-slate-600"}`}>
                                                                    {day}
                                                                </button>
                                                            ) : <div className="h-8 w-8" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Day schedule */}
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between shrink-0 z-10">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium text-slate-500">All day</span>
                                                    </label>
                                                    <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                                                        className="h-7 text-xs font-bold border-none bg-amber-50 rounded-md px-2.5 w-[220px] text-amber-800 text-right"
                                                        placeholder="Task title..." />
                                                </div>
                                                <div className="flex-1 overflow-y-auto px-4 py-1">
                                                    {timeSlots.map((slot) => (
                                                        <div key={slot}
                                                            onClick={() => {
                                                                setAllDay(false);
                                                                const match = slot.match(/(\d+):(\d+)(AM|PM)/);
                                                                if (match) {
                                                                    let h = parseInt(match[1]);
                                                                    if (match[3] === "PM" && h !== 12) h += 12;
                                                                    if (match[3] === "AM" && h === 12) h = 0;
                                                                    setSelectedTime(`${String(h).padStart(2, "0")}:${match[2]}`);
                                                                }
                                                            }}
                                                            className="flex items-center border-b border-slate-50 py-2.5 cursor-pointer hover:bg-purple-50 rounded px-2 transition-colors">
                                                            <span className="text-[11px] font-semibold text-slate-400 w-16">{slot}</span>
                                                            <div className="flex-1 h-px bg-slate-100 ml-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom bar: Set/Cancel */}
                                        <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between bg-slate-50/80">
                                            <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0 overflow-hidden">
                                                <CalendarPlus className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                <span className="text-blue-600 font-bold shrink-0">Task</span>
                                                <span className="text-slate-400 shrink-0">due</span>
                                                <span className="text-blue-600 font-bold shrink-0">{taskDueLabel}</span>
                                                <span className="text-slate-400 shrink-0">{allDay ? "All day" : selectedTime}</span>
                                                <span className="text-slate-400 shrink-0">for</span>
                                                <span className="text-blue-600 font-bold truncate">{patient.name}</span>
                                                <span className="text-slate-300 shrink-0">⊙</span>
                                                <span className="font-bold text-slate-600 shrink-0">{taskTitle}:</span>
                                                <Input value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)}
                                                    className="h-7 text-xs border-none bg-transparent flex-1 min-w-[80px] px-1" placeholder="Add description..." />
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 ml-3">
                                                <Button onClick={handleSetTask} disabled={savingTask || !taskTitle.trim() || !selectedDate} size="sm"
                                                    className="h-8 px-6 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm">
                                                    {savingTask ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set"}
                                                </Button>
                                                <button onClick={() => setShowTaskPicker(false)} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
