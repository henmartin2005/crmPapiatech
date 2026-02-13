import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Phone,
    Mail,
    Clock,
    Loader2,
    Instagram,
    Facebook,
    MessageCircle,
    Tag,
    User,
    MoreHorizontal,
    MoveRight,
    Trash2,
    X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const KANBAN_COLUMNS = [
    { id: "NEW", title: "New Lead", color: "#3B82F6", border: "border-l-[#3B82F6]" },
    { id: "CONTACTED", title: "Conversation", color: "#F59E0B", border: "border-l-[#F59E0B]" },
    { id: "PROPOSAL_SENT", title: "Proposal", color: "#10B981", border: "border-l-[#10B981]" },
    { id: "PAYMENT_INITIAL", title: "Initial Payment", color: "#8B5CF6", border: "border-l-[#8B5CF6]" },
    { id: "ACTIVE", title: "Treatment", color: "#EC4899", border: "border-l-[#EC4899]" },
    { id: "INACTIVE", title: "Inactive", color: "#6B7280", border: "border-l-[#6B7280]" },
];

interface PatientKanbanProps {
    onSelectPatient: (id: string) => void;
    sortBy: "created_at" | "updated_at";
    sortOrder: "asc" | "desc";
}

export function PatientKanban({ onSelectPatient, sortBy, sortOrder }: PatientKanbanProps) {
    const [columns, setColumns] = useState<Record<string, { id: string; title: string; color: string; border: string; items: any[] }>>({});
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchPatients = useCallback(async () => {
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .order(sortBy, { ascending: sortOrder === "asc" });

        if (error) {
            console.error("Error fetching patients:", error);
            setLoading(false);
            return;
        }

        const cols: Record<string, { id: string; title: string; color: string; border: string; items: any[] }> = {};
        KANBAN_COLUMNS.forEach(col => {
            cols[col.id] = { ...col, items: data.filter(p => p.status === col.id) };
        });
        setColumns(cols);
        setLoading(false);
    }, [sortBy, sortOrder]);

    useEffect(() => {
        fetchPatients();

        // Stable real-time subscription
        const channel = supabase
            .channel("kanban-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "patients" },
                () => {
                    fetchPatients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchPatients]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, { ...removed, status: destination.droppableId });

            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems },
            });

            const { error } = await supabase
                .from("patients")
                .update({ status: destination.droppableId, updated_at: new Date().toISOString() })
                .eq("id", draggableId);

            if (error) {
                console.error("Error updates status:", error);
                fetchPatients();
            }
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkMove = async (newStatus: string) => {
        if (selectedIds.length === 0) return;

        const { error } = await supabase
            .from("patients")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .in("id", selectedIds);

        if (error) {
            console.error("Error bulk moving patients:", error);
        } else {
            setSelectedIds([]);
            fetchPatients();
        }
    };

    const formatDatePrecise = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).replace(",", "");
    };

    const getSourceIcon = (source: string | null) => {
        switch (source?.toLowerCase()) {
            case "instagram": return <Instagram className="h-2.5 w-2.5 text-pink-500" />;
            case "facebook": return <Facebook className="h-2.5 w-2.5 text-blue-600" />;
            case "whatsapp": return <MessageCircle className="h-2.5 w-2.5 text-green-500" />;
            default: return <User className="h-2.5 w-2.5 text-slate-400" />;
        }
    };

    if (loading && Object.keys(columns).length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="absolute top-[-60px] left-0 right-0 z-[100] flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900 text-white rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-6 border border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black">
                                {selectedIds.length}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Selected Items</span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Move to:</span>
                            <div className="flex gap-1">
                                {KANBAN_COLUMNS.map(col => (
                                    <button
                                        key={col.id}
                                        onClick={() => handleBulkMove(col.id)}
                                        className="px-2 py-1 rounded-lg text-[9px] font-bold hover:bg-white/10 transition-colors border border-white/5"
                                        style={{ color: col.color }}
                                    >
                                        {col.title.split(" ")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-0.5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                <DragDropContext onDragEnd={onDragEnd}>
                    {KANBAN_COLUMNS.map((colDef) => {
                        const column = columns[colDef.id] || { ...colDef, items: [] };
                        return (
                            <div key={column.id} className="flex-1 min-w-[200px] flex flex-col bg-slate-50/30 border-r border-slate-200/60 last:border-r-0 overflow-hidden first:rounded-l-2xl last:rounded-r-2xl">
                                <div className="p-2.5 flex items-center justify-between shrink-0 shadow-sm" style={{ backgroundColor: column.color }}>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-wider">{column.title}</h3>
                                        <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-bold text-white border border-white/10">{column.items.length}</span>
                                    </div>
                                    <MoreHorizontal className="h-3.5 w-3.5 text-white/70" />
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex-1 min-h-0 overflow-hidden relative"
                                        >
                                            <ScrollArea className="h-full w-full">
                                                <div className={`p-1 space-y-0.5 min-h-full transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-white/50' : ''}`}>
                                                    {column.items.map((item, index) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    onClick={() => onSelectPatient(item.id)}
                                                                    className="group outline-none relative"
                                                                >
                                                                    {/* Checkbox on hover/selected */}
                                                                    <div
                                                                        className={`absolute top-2.5 left-2.5 z-20 transition-opacity ${selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                                        onClick={(e) => toggleSelect(item.id, e)}
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedIds.includes(item.id)}
                                                                            className="h-4 w-4 bg-white/80 border-slate-200 shadow-sm data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 transition-all duration-200"
                                                                        />
                                                                    </div>

                                                                    <Card
                                                                        className={`cursor-pointer border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden bg-white ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-400/20 z-50' : ''} ${selectedIds.includes(item.id) ? 'ring-2 ring-purple-500/50 bg-purple-50/5' : ''}`}
                                                                        style={{ borderLeft: `4px solid ${column.color}` }}
                                                                    >
                                                                        <div className="p-2.5 flex flex-col gap-2">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className={`flex flex-col min-w-0 transition-all duration-200 ${selectedIds.includes(item.id) ? 'pl-5' : 'group-hover:pl-5'}`}>
                                                                                    <span className="text-[14px] font-bold text-slate-900 tracking-tight leading-none truncate">
                                                                                        {item.name}
                                                                                    </span>
                                                                                    <div className="mt-1.5 self-start">
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 uppercase tracking-tight">
                                                                                            {item.service || "General"}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 shrink-0">
                                                                                    {getSourceIcon(item.source)}
                                                                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">{item.source || "Web"}</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-col gap-1.5">
                                                                                {item.phone && (
                                                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 leading-none">
                                                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                                                        {item.phone}
                                                                                    </div>
                                                                                )}
                                                                                <div className="pt-1.5 border-t border-slate-50 flex flex-col gap-1">
                                                                                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Clock className="h-2 w-2 opacity-50" />
                                                                                            Created: {formatDatePrecise(item.created_at)}
                                                                                        </span>
                                                                                        <span className="flex items-center gap-1 text-slate-500">
                                                                                            <Clock className="h-2 w-2 text-blue-400" />
                                                                                            Updated: {formatDatePrecise(item.updated_at)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </DragDropContext>
            </div>
        </div>
    );
}
