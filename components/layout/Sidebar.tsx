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
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/patients", icon: Users, label: "Clients" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Appointments" },
    { href: "/dashboard/services", icon: Briefcase, label: "Services" },
    { href: "/dashboard/traffic", icon: BarChart, label: "Traffic" },
    { href: "/dashboard/automations", icon: Workflow, label: "Automations" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
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
            <div className="flex flex-col items-center pt-0 pb-0 px-2 mb-0 shrink-0">
                <img
                    src="/logo-papia.png"
                    alt="Papia Technology Solutions"
                    className="h-48 w-auto object-contain mix-blend-multiply brightness-90 contrast-125 transition-all"
                />
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
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
