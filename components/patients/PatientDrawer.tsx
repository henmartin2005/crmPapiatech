"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, MessageSquare, Phone, Clock, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string | null;
}

export function PatientDrawer({ open, onOpenChange, patientId }: PatientDrawerProps) {
    // Mock data fetching based on ID
    const patient = patientId ? {
        id: patientId,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+1 234 567 890",
        country: "México",
        source: "Facebook Ads",
        service: "Implante Dental",
        status: "NEW",
        notes: "Interesado en presupuesto para implante completo. Contactar por la tarde.",
        autoFollowup: false,
    } : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl">{patient?.name}</SheetTitle>
                    <SheetDescription>
                        {patient?.service} • {patient?.status}
                    </SheetDescription>
                </SheetHeader>

                {patient && (
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="flex space-x-2">
                            <Button size="sm" className="flex-1"><MessageSquare className="mr-2 h-4 w-4" /> WhatsApp</Button>
                            <Button size="sm" variant="outline" className="flex-1"><Mail className="mr-2 h-4 w-4" /> Email</Button>
                            <Button size="sm" variant="outline" className="flex-1"><Calendar className="mr-2 h-4 w-4" /> Cita</Button>
                        </div>

                        <Separator />

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <div className="font-medium">{patient.email}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Teléfono</Label>
                                <div className="font-medium">{patient.phone}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">País</Label>
                                <div className="font-medium">{patient.country}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Fuente</Label>
                                <div className="font-medium">{patient.source}</div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                            <Label className="text-muted-foreground mb-1 block">Notas</Label>
                            <p>{patient.notes}</p>
                        </div>

                        <Separator />

                        {/* Automation & Checklist */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Seguimiento Automático</Label>
                                    <div className="text-xs text-muted-foreground">Enviar emails cada 7 días si no responde</div>
                                </div>
                                <Switch checked={patient.autoFollowup} />
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Checklist de Acciones</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c1" />
                                        <label htmlFor="c1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Conversación inicial realizada
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c2" />
                                        <label htmlFor="c2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Presupuesto enviado
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Timeline */}
                        <div>
                            <h4 className="font-medium mb-3">Actividad Reciente</h4>
                            <div className="space-y-4 pl-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 relative pb-4 border-l last:border-0 border-muted-foreground/20 pl-4">
                                        <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">Email Enviado</p>
                                            <p className="text-xs text-muted-foreground">Propuesta inicial enviada .</p>
                                            <div className="flex items-center pt-1 text-xs text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" /> Hace {i} días
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
