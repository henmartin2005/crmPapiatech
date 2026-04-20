"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown } from "lucide-react";
import { ClientKanban } from "@/components/clients/ClientKanban";
import { ClientList } from "@/components/clients/ClientList";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import { LeadDialog } from "@/components/clients/LeadDialog";
import { PipelineDialog } from "@/components/clients/PipelineDialog";
import { cn } from "@/lib/utils";
import { Plus, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientsPage() {
    const [view, setView] = useState("kanban");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"created_at" | "updated_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const handleSelectClient = (id: string) => {
        setSelectedClientId(id);
        setIsDrawerOpen(true);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
            <Tabs defaultValue="kanban" className="w-full flex-1 flex flex-col min-h-0" onValueChange={setView}>
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <TabsList className="bg-[#f5f2ee] p-1 rounded-xl h-10 border border-border-primary">
                        <TabsTrigger 
                            value="kanban" 
                            className="rounded-lg px-6 text-[11px] font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-primary data-[state=active]:shadow-sm transition-all"
                        >
                            Pipeline (Kanban)
                        </TabsTrigger>
                        <TabsTrigger 
                            value="list" 
                            className="rounded-lg px-6 text-[11px] font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-primary data-[state=active]:shadow-sm transition-all"
                        >
                            List View (Table)
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-[#f5f2ee] p-0.5 rounded-lg border border-border-primary">
                            <button
                                onClick={() => setSortBy("created_at")}
                                className={cn(
                                    "px-3 py-1 text-[9.5px] font-bold rounded-md transition-all",
                                    sortBy === "created_at" ? "bg-white text-orange-primary shadow-sm" : "text-text-placeholder hover:text-text-secondary"
                                )}
                            >
                                Creado
                            </button>
                            <button
                                onClick={() => setSortBy("updated_at")}
                                className={cn(
                                    "px-3 py-1 text-[9.5px] font-bold rounded-md transition-all",
                                    sortBy === "updated_at" ? "bg-white text-orange-primary shadow-sm" : "text-text-placeholder hover:text-text-secondary"
                                )}
                            >
                                Modificado
                            </button>
                        </div>
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="h-8 w-8 flex items-center justify-center bg-white border border-border-primary rounded-lg shadow-sm hover:bg-orange-light transition-all text-orange-primary"
                        >
                            {sortOrder === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <PipelineDialog trigger={
                            <Button variant="outline" className="h-10 px-4 rounded-xl border-border-primary text-text-secondary text-[11px] font-bold hover:bg-orange-light transition-all flex items-center gap-2">
                                <Kanban className="h-3.5 w-3.5 text-text-placeholder" /> + Pipeline
                            </Button>
                        } />
                        <LeadDialog trigger={
                            <Button className="h-10 px-6 rounded-xl bg-orange-primary hover:bg-orange-dark text-white text-[11px] font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(234,88,12,0.25)] flex items-center gap-2">
                                <Plus className="h-4 w-4" /> New Lead
                            </Button>
                        } />
                    </div>
                </div>

                <TabsContent value="kanban" className="flex-1 mt-0 outline-none flex flex-col min-h-0 overflow-x-auto">
                    <ClientKanban onSelectClient={handleSelectClient} sortBy={sortBy} sortOrder={sortOrder} />
                </TabsContent>
                <TabsContent value="list" className="flex-1 mt-0 outline-none flex flex-col min-h-0 bg-white border border-border-primary rounded-[11px] overflow-hidden">
                    <ClientList onSelectClient={handleSelectClient} />
                </TabsContent>
            </Tabs>

            <ClientDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                clientId={selectedClientId}
            />
        </div>
    );
}
