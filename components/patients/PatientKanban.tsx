"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data (replace with API later)
const initialColumns = {
    NEW: { id: "NEW", title: "Nuevo Contacto", items: [{ id: "p1", name: "Juan Pérez", status: "NEW", service: "Implante" }] },
    CONTACTED: { id: "CONTACTED", title: "Conversación Inicial", items: [] },
    PROPOSAL_SENT: { id: "PROPOSAL_SENT", title: "Presupuesto Enviado", items: [{ id: "p2", name: "Maria Garcia", status: "PROPOSAL_SENT", service: "Ortodoncia" }] },
    PAYMENT_INITIAL: { id: "PAYMENT_INITIAL", title: "Pago Inicial", items: [] },
    ACTIVE: { id: "ACTIVE", title: "Tratamiento Activo", items: [] },
    INACTIVE: { id: "INACTIVE", title: "Inactivo / Perdido", items: [] },
};

export function PatientKanban({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
    const [columns, setColumns] = useState(initialColumns);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId as keyof typeof columns];
            const destColumn = columns[destination.droppableId as keyof typeof columns];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, { ...removed, status: destination.droppableId });
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems },
            });
            // TODO: Call API to update status
        } else {
            const column = columns[source.droppableId as keyof typeof columns];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...column, items: copiedItems },
            });
        }
    };

    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.values(columns).map((column) => (
                    <div key={column.id} className="flex flex-col min-w-[300px] bg-muted/50 rounded-lg border p-2">
                        <h3 className="font-semibold mb-3 px-2 flex justify-between items-center text-sm uppercase text-muted-foreground">
                            {column.title} <Badge variant="secondary">{column.items.length}</Badge>
                        </h3>
                        <Droppable droppableId={column.id}>
                            {(provided) => (
                                <ScrollArea className="h-[calc(100vh-220px)]">
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3 min-h-[100px]"
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style }}
                                                        onClick={() => onSelectPatient(item.id)}
                                                    >
                                                        <Card className="cursor-pointer hover:border-primary transition-colors">
                                                            <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                                                                <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                </Button>
                                                            </CardHeader>
                                                            <CardContent className="p-3 text-xs space-y-2">
                                                                <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                                                                    {item.service}
                                                                </Badge>
                                                                <div className="flex items-center text-muted-foreground">
                                                                    <Phone className="mr-1 h-3 w-3" /> +1 234 567 890
                                                                </div>
                                                                <div className="flex items-center text-muted-foreground">
                                                                    <Calendar className="mr-1 h-3 w-3" /> Hace 2 días
                                                                </div>
                                                            </CardContent>
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
                ))}
            </DragDropContext>
        </div>
    );
}
