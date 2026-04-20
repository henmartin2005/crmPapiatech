"use client";

import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
    Loader2, 
    X,
    MessageCircle,
    Instagram,
    Facebook,
    Tag
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn, getLightColor, getDarkColor, normalizeStatus } from "@/lib/utils";
import { InactivityBadge } from "./InactivityBadge";

interface ClientKanbanProps {
    onSelectClient: (id: string) => void;
    sortBy: "created_at" | "updated_at";
    sortOrder: "asc" | "desc";
}

export function ClientKanban({ onSelectClient, sortBy, sortOrder }: ClientKanbanProps) {
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [clientsByStage, setClientsByStage] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [editingStage, setEditingStage] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: pipelineData } = await supabase.from("pipelines").select("*").order("position", { ascending: true });
            const { data: clientData } = await supabase
                .from("clients")
                .select("*")
                .order(sortBy, { ascending: sortOrder === "asc" });

            const DEFAULT_STAGES = [
                { id: "NEW", name: "NEW LEAD", color: "#3B82F6", position: 0 },
                { id: "CONTACTED", name: "CONVERSATION", color: "#F59E0B", position: 1 },
                { id: "PROPOSAL_SENT", name: "PROPOSAL", color: "#10B981", position: 2 },
                { id: "PAYMENT_INITIAL", name: "INITIAL PAYMENT", color: "#8B5CF6", position: 3 },
                { id: "ACTIVE", name: "TREATMENT", color: "#EC4899", position: 4 },
                { id: "INACTIVE", name: "INACTIVE", color: "#6B7280", position: 5 }
            ];

            const basePipelines = (pipelineData && pipelineData.length > 0) ? pipelineData : DEFAULT_STAGES;
            
            const grouped: Record<string, any[]> = {};
            const matchedIds = new Set();

            basePipelines.forEach(p => {
                const filtered = clientData?.filter(c => {
                    if (matchedIds.has(c.id)) return false;
                    const normalized = normalizeStatus(c.status).trim().toUpperCase();
                    const pName = p.name.trim().toUpperCase();
                    const match = normalized === pName || c.status?.trim().toUpperCase() === p.id?.trim().toUpperCase();
                    if (match) matchedIds.add(c.id);
                    return match;
                }) || [];
                grouped[p.name] = filtered;
            });

            // Fallback for unmatched clients
            const unmatched = clientData?.filter(c => !matchedIds.has(c.id)) || [];
            let finalPipelines = [...basePipelines];
            
            if (unmatched.length > 0) {
                grouped["Uncategorized"] = unmatched;
                if (!finalPipelines.find(p => p.name.toUpperCase() === "UNCATEGORIZED")) {
                    finalPipelines.push({ id: "UNCAT", name: "Uncategorized", color: "#94a3b8" });
                }
            }

            setPipelines(finalPipelines);
            setClientsByStage(grouped);
        } catch (error) {
            console.error("Error loading Kanban data:", error);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder]);

    useEffect(() => {
        fetchData();
        
        const channel = supabase.channel('kanban-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => fetchData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchData]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        const newStage = destination.droppableId;
        
        // Optimistic update
        const sourceItems = [...(clientsByStage[source.droppableId] || [])];
        const destItems = source.droppableId === newStage ? sourceItems : [...(clientsByStage[newStage] || [])];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, { ...removed, status: newStage });

        setClientsByStage(prev => ({
            ...prev,
            [source.droppableId]: sourceItems,
            [newStage]: destItems
        }));

        // Database update
        const { error } = await supabase
            .from("clients")
            .update({ status: newStage, updated_at: new Date().toISOString() })
            .eq("id", draggableId);

        if (error) {
            console.error("Error updating client stage:", error);
            fetchData();
        }
    };

    const handleUpdatePipelineName = async (id: string, oldName: string, newName: string) => {
        if (!newName || newName === oldName) {
            setEditingStage(null);
            return;
        }
        await supabase.from("pipelines").update({ name: newName }).eq("id", id);
        setEditingStage(null);
        fetchData();
    };

    const handleDeletePipeline = async (id: string, name: string) => {
        if ((clientsByStage[name]?.length || 0) > 0) return;
        await supabase.from("pipelines").delete().eq("id", id);
        fetchData();
    };

    const getSourceIcon = (source: string | null) => {
        switch (source?.toLowerCase()) {
            case "instagram": return <Instagram className="h-2.5 w-2.5 text-pink-500" />;
            case "facebook": return <Facebook className="h-2.5 w-2.5 text-blue-600" />;
            case "whatsapp": return <MessageCircle className="h-2.5 w-2.5 text-green-500" />;
            default: return <Tag className="h-2.5 w-2.5 text-slate-400" />;
        }
    };

    if (loading && pipelines.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-180px)]">
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 px-1">
                <DragDropContext onDragEnd={onDragEnd}>
                    {pipelines.map(pipeline => (
                        <div 
                            key={pipeline.id} 
                            className="flex-1 min-w-[220px] shrink-0 flex flex-col rounded-[12px] overflow-hidden border border-[rgba(0,0,0,0.05)] shadow-sm h-full transition-all"
                            style={{ backgroundColor: getLightColor(pipeline.color || "#EA580C") }}
                        >
                            <div className="p-2.5 flex items-center justify-between group">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {editingStage === pipeline.id ? (
                                        <input 
                                            autoFocus
                                            className="bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-wider focus:ring-0 w-full"
                                            style={{ color: pipeline.color }}
                                            defaultValue={pipeline.name}
                                            onBlur={(e) => handleUpdatePipelineName(pipeline.id, pipeline.name, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                        />
                                    ) : (
                                    <h3 
                                        className="text-[11px] font-semibold uppercase tracking-wide truncate cursor-text"
                                        style={{ color: pipeline.color }}
                                        onClick={() => setEditingStage(pipeline.id)}
                                    >
                                        {pipeline.name}
                                    </h3>
                                    )}
                                    <span 
                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
                                        style={{ 
                                            backgroundColor: adjustColor(pipeline.color || "#000", 180),
                                            color: getDarkColor(pipeline.color || "#000")
                                        }}
                                    >
                                        {clientsByStage[pipeline.name]?.length || 0}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => handleDeletePipeline(pipeline.id, pipeline.name)}
                                    className={cn(
                                        "p-1 rounded-md transition-opacity opacity-0 group-hover:opacity-100",
                                        (clientsByStage[pipeline.name]?.length || 0) > 0 ? "cursor-not-allowed text-slate-300" : "text-slate-400 hover:bg-white/50 hover:text-red-500"
                                    )}
                                    disabled={(clientsByStage[pipeline.name]?.length || 0) > 0}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>

                            <Droppable droppableId={pipeline.name}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 p-2 space-y-2 transition-colors overflow-y-auto custom-scrollbar",
                                            snapshot.isDraggingOver && "bg-white/30"
                                        )}
                                    >
                                        {clientsByStage[pipeline.name]?.map((client, index) => (
                                            <Draggable key={client.id} draggableId={client.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => onSelectClient(client.id)}
                                                    >
                                                        <div className={cn(
                                                            "bg-white p-3 rounded-[7px] border shadow-sm cursor-pointer transition-all hover:shadow-md group relative",
                                                            snapshot.isDragging && "shadow-xl ring-2 ring-orange-primary/20 scale-[1.02] z-50"
                                                        )}
                                                        style={{ borderColor: adjustColor(pipeline.color || "#EA580C", 160) }}
                                                        >
                                                            <h4 
                                                            className="text-[13px] font-semibold leading-tight mb-2 truncate"
                                                            style={{ color: getDarkColor(pipeline.color || "#C2410C") }}
                                                        >
                                                            {client.name}
                                                        </h4>
                                                            <p className="text-[10px] font-medium uppercase tracking-tight text-text-placeholder mb-3">
                                                            {client.service || "InfoWeb Plan"}
                                                        </p>
                                                            
                                                            <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.04)]">
                                                                <InactivityBadge lastContactAt={client.last_contact_at} />
                                                                <div 
                                                                    className="px-1.5 py-0.5 rounded-md flex items-center gap-1"
                                                                    style={{ 
                                                                        backgroundColor: adjustColor(pipeline.color || "#000", 200),
                                                                        color: pipeline.color 
                                                                    }}
                                                                >
                                                                    {getSourceIcon(client.lead_source || client.source)}
                                                                    <span className="text-[8px] font-bold uppercase tracking-tighter">
                                                                        {client.lead_source || client.source || "Direct"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
}

function adjustColor(hex: string, amount: number) {
    return '#' + hex.replace(/^#/, '').replace(/../g, hex => ('00' + Math.min(255, Math.max(0, parseInt(hex, 16) + amount)).toString(16)).slice(-2));
}
