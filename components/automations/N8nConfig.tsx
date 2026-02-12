"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Workflow } from "lucide-react";

export function N8nConfig() {
    const [webhookUrl, setWebhookUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSave = () => {
        // TODO: Save to DB via API
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
    };

    const handleTest = () => {
        // TODO: Trigger test webhook
        alert("Webhook de prueba enviado a: " + webhookUrl);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-primary" />
                    Configuración de n8n
                </CardTitle>
                <CardDescription>
                    Conecta CRM Papiatech con tus flujos de trabajo en n8n.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL del Webhook (n8n)</Label>
                    <Input
                        id="webhook-url"
                        placeholder="https://n8n.tu-dominio.com/webhook/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="secret">Token Secreto (Opcional)</Label>
                    <Input
                        id="secret"
                        type="password"
                        placeholder="••••••••"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Este token se enviará en el header `X-Webhook-Secret` para verificar la autenticidad.
                    </p>
                </div>

                {status === "success" && (
                    <Alert className="bg-green-50 text-green-900 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Guardado</AlertTitle>
                        <AlertDescription>La configuración se ha actualizado correctamente.</AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleTest}>Probar Webhook</Button>
                    <Button onClick={handleSave}>Guardar Configuración</Button>
                </div>
            </CardContent>
        </Card>
    );
}
