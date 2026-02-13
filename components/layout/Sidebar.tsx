"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    BarChart,
    Workflow,
    Settings,
    LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const sidebarItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
    { href: "/dashboard/patients", icon: Users, label: "Pacientes" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Citas" },
    { href: "/dashboard/services", icon: Briefcase, label: "Servicios" },
    { href: "/dashboard/traffic", icon: BarChart, label: "Tráfico Web" },
    { href: "/dashboard/automations", icon: Workflow, label: "Automatizaciones" },
    { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/"); // o "/login" si tienes esa ruta
        router.refresh();
    };

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-64 p-4 space-y-4">
            <div className="flex items-center h-12 px-2">
                <h1 className="text-xl font-bold tracking-tight text-primary">CRM Papiatech</h1>
            </div>

            <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                type="button"
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive && "bg-secondary text-primary font-medium"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
