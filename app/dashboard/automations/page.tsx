import { N8nConfig } from "@/components/automations/N8nConfig";

export default function AutomationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Automatizaciones</h2>
                <p className="text-muted-foreground">Gestiona las integraciones externas y flujos de trabajo.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-2">
                    <N8nConfig />
                </div>
                <div>
                    {/* Future sidebar for help or stats */}
                </div>
            </div>
        </div>
    );
}
