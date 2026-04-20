"use client";

import { Box, Plus, Search, Tag, MoreVertical, CreditCard, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SERVICES = [
    { id: 1, name: "InfoWeb Plan", category: "Web Design", price: "$499", status: "Active", description: "Sitio web informativo de 5 secciones con optimización SEO básica." },
    { id: 2, name: "Starter Plan", category: "Web Design", price: "$899", status: "Active", description: "Tienda online básica con pasarela de pagos y gestión de inventario." },
    { id: 3, name: "Chat AI Agent", category: "Automation", price: "$299/mo", status: "Active", description: "Agente de IA personalizado para atención al cliente 24/7." },
    { id: 4, name: "Sistema de Citas", category: "Software", price: "$1,200", status: "Active", description: "Plataforma completa de reserva de citas y gestión de calendario." },
];

export default function ServicesPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                        <Box className="h-4 w-4 text-orange-primary" /> Catálogo de Servicios
                    </h1>
                    <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                        Define los paquetes y precios ofrecidos a los clientes
                    </p>
                </div>
                <Button className="h-9 px-4 rounded-xl bg-orange-primary text-white text-[11px] font-bold hover:bg-orange-dark shadow-sm gap-2">
                    <Plus className="h-3.5 w-3.5" /> Agregar Servicio
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {SERVICES.map((service) => (
                    <div key={service.id} className="bg-white border border-border-primary rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-orange-light text-orange-primary group-hover:bg-orange-primary group-hover:text-white transition-colors">
                                <Layout className="h-5 w-5" />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-placeholder">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-1 mb-4">
                            <h3 className="text-[14px] font-semibold text-text-main">{service.name}</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] font-bold uppercase border-border-primary text-text-placeholder">
                                    {service.category}
                                </Badge>
                                <span className="text-[14px] font-black text-orange-primary">{service.price}</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-text-secondary leading-relaxed mb-6">
                            {service.description}
                        </p>

                        <div className="pt-4 border-t border-border-primary flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                                <span className="text-[10px] font-bold text-text-secondary uppercase">Disponible</span>
                            </div>
                            <Button variant="ghost" className="h-8 text-[10px] font-bold text-orange-primary hover:bg-orange-light rounded-lg uppercase tracking-wider">
                                Editar Plan
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
