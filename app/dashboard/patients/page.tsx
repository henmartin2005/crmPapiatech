"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
// We will create these components next
import { PatientKanban } from "@/components/patients/PatientKanban";
import { PatientTable } from "@/components/patients/PatientList";
import { PatientDrawer } from "@/components/patients/PatientDrawer";

export default function PatientsPage() {
    const [view, setView] = useState("kanban");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const handleCreatePatient = () => {
        setSelectedPatientId(null);
        setIsDrawerOpen(true);
    };

    const handleSelectPatient = (id: string) => {
        setSelectedPatientId(id);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Pacientes y Seguimiento</h2>
                <Button onClick={handleCreatePatient}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Paciente
                </Button>
            </div>

            <Tabs defaultValue="kanban" className="w-full" onValueChange={setView}>
                <TabsList>
                    <TabsTrigger value="kanban">Pipeline (Kanban)</TabsTrigger>
                    <TabsTrigger value="list">Lista (Tabla)</TabsTrigger>
                </TabsList>
                <TabsContent value="kanban" className="mt-4">
                    <PatientKanban onSelectPatient={handleSelectPatient} />
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                    <PatientTable onSelectPatient={handleSelectPatient} />
                </TabsContent>
            </Tabs>

            <PatientDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                patientId={selectedPatientId}
            />
        </div>
    );
}
