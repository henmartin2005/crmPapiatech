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
            <div className="flex justify-between items-end pb-4 border-b border-slate-200/50 mb-2">
                <div>
                    <h2 className="text-4xl font-black tracking-tight font-outfit text-slate-800">Client Management</h2>
                    <p className="text-slate-500 font-medium">Track your leads and manage patient treatments efficiently.</p>
                </div>
                <Button
                    onClick={handleCreatePatient}
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                    New Client Lead
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
