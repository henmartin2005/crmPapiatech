"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
// We will create these components next
import { PatientKanban } from "@/components/patients/PatientKanban";
import { PatientTable } from "@/components/patients/PatientList";
import { PatientDrawer } from "@/components/patients/PatientDrawer";

export default function PatientsPage() {
    const [view, setView] = useState("kanban");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"created_at" | "updated_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const handleCreatePatient = () => {
        setSelectedPatientId(null);
        setIsDrawerOpen(true);
    };

    const handleSelectPatient = (id: string) => {
        setSelectedPatientId(id);
        setIsDrawerOpen(true);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-end pb-4 border-b border-slate-200/50 mb-4 shrink-0 px-1">
                <div>
                    <h2 className="text-4xl font-black tracking-tight font-jakarta text-slate-800">Client Management</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Track your leads and manage patient treatments efficiently.</p>
                </div>
                <Button
                    onClick={handleCreatePatient}
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                    New Client Lead
                </Button>
            </div>

            <Tabs defaultValue="kanban" className="w-full flex-1 flex flex-col min-h-0" onValueChange={setView}>
                <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
                        <TabsTrigger value="kanban" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all">Pipeline (Kanban)</TabsTrigger>
                        <TabsTrigger value="list" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all">List View (Table)</TabsTrigger>
                    </TabsList>

                    {view === "kanban" && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button
                                    onClick={() => setSortBy("created_at")}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${sortBy === "created_at" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Created
                                </button>
                                <button
                                    onClick={() => setSortBy("updated_at")}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${sortBy === "updated_at" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Modified
                                </button>
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-purple-700"
                                title={sortOrder === "asc" ? "Ascending Order" : "Descending Order"}
                            >
                                {sortOrder === "asc" ? (
                                    <ArrowUp className="h-4 w-4 stroke-[3]" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 stroke-[3]" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <TabsContent value="kanban" className="flex-1 mt-0 outline-none flex flex-col min-h-0">
                    <PatientKanban onSelectPatient={handleSelectPatient} sortBy={sortBy} sortOrder={sortOrder} />
                </TabsContent>
                <TabsContent value="list" className="flex-1 mt-0 outline-none flex flex-col min-h-0">
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
