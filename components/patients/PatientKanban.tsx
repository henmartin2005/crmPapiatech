import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Phone,
    Mail,
    Clock,
    Loader2,
    Instagram,
    Facebook,
    MessageCircle,
    Tag,
    User
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const KANBAN_COLUMNS = [
    { id: "NEW", title: "Nuevo Contacto", color: "#3B82F6", border: "border-l-[#3B82F6]" },
    { id: "CONTACTED", title: "Conversación", color: "#F59E0B", border: "border-l-[#F59E0B]" },
    { id: "PROPOSAL_SENT", title: "Presupuesto", color: "#10B981", border: "border-l-[#10B981]" },
    { id: "PAYMENT_INITIAL", title: "Pago Inicial", color: "#8B5CF6", border: "border-l-[#8B5CF6]" },
    { id: "ACTIVE", title: "Tratamiento", color: "#EC4899", border: "border-l-[#EC4899]" },
    { id: "INACTIVE", title: "Inactivo", color: "#6B7280", border: "border-l-[#6B7280]" },
];

export function PatientKanban({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
    const [columns, setColumns] = useState<Record<string, { id: string; title: string; color: string; border: string; items: any[] }>>({});
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .order("created_at", { ascending: false });

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
    };

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
    }, []);

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

    if (loading && Object.keys(columns).length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case "WhatsApp": return <MessageCircle className="h-3 w-3 text-green-500" />;
            case "Instagram": return <Instagram className="h-3 w-3 text-pink-500" />;
            case "Facebook": return <Facebook className="h-3 w-3 text-blue-600" />;
            default: return <Tag className="h-3 w-3 text-slate-400" />;
        }
    };

    return (
        <div className="flex bg-slate-100 rounded-3xl p-3 gap-3 overflow-x-auto pb-4 custom-scrollbar h-[calc(100vh-210px)] border border-slate-200 shadow-inner">
            <DragDropContext onDragEnd={onDragEnd}>
                {KANBAN_COLUMNS.map((colDef) => {
                    const column = columns[colDef.id] || { ...colDef, items: [] };
                    return (
                        <div key={column.id} className="flex flex-col min-w-[220px] max-w-[260px] flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="h-11 px-3 flex items-center justify-between" style={{ backgroundColor: column.color }}>
                                <h3 className="font-black text-[11px] uppercase tracking-[0.1em] text-white">
                                    {column.title}
                                </h3>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-black h-5 px-1.5 rounded-md">
                                    {column.items.length}
                                </Badge>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <ScrollArea className="flex-1">
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`p-1.5 space-y-1.5 min-h-[150px] transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-slate-50' : ''}`}
                                        >
                                            {column.items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                            onClick={() => onSelectPatient(item.id)}
                                                            className="group outline-none"
                                                        >
                                                            <Card
                                                                className={`cursor-pointer border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden bg-white ${snapshot.isDragging ? 'shadow-xl ring-2 ring-purple-400/20 z-50' : ''}`}
                                                                style={{ borderLeft: `4px solid ${column.color}` }}
                                                            >
                                                                <div className="p-2 space-y-1">
                                                                    <div className="flex justify-between items-start gap-1">
                                                                        <span className="text-[12px] font-bold text-slate-800 tracking-tight leading-tight truncate">
                                                                            {item.name}
                                                                        </span>
                                                                        <div className="shrink-0 opacity-80">
                                                                            {getSourceIcon(item.source)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        {item.phone && (
                                                                            <div className="text-[10px] font-medium text-slate-500 leading-tight">
                                                                                {item.phone}
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-300 uppercase tracking-tighter">
                                                                            <span className="flex items-center gap-0.5">
                                                                                <Clock className="h-2 w-2" />
                                                                                {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : "-"}
                                                                            </span>
                                                                            <span className="text-slate-100">•</span>
                                                                            <span className="flex items-center gap-0.5">
                                                                                <Loader2 className="h-2 w-2" />
                                                                                {item.updated_at ? new Date(item.updated_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : "Hoy"}
                                                                            </span>
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
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </DragDropContext>
        </div>
    );
}
