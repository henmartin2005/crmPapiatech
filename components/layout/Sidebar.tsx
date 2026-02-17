"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    UserCog,
    ClipboardList,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const sidebarItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/patients", icon: Users, label: "Clients" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Appointments" },
    { href: "/dashboard/services", icon: Briefcase, label: "Services" },
    { href: "/dashboard/traffic", icon: BarChart, label: "Traffic" },
    { href: "/dashboard/automations", icon: Workflow, label: "Automations" },
    { href: "/dashboard/tasks", icon: ClipboardList, label: "Tasks" },
    { href: "/dashboard/users", icon: UserCog, label: "Users" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [pendingTaskCount, setPendingTaskCount] = useState(0);

    // Fetch pending task count
    useEffect(() => {
        const fetchPendingCount = async () => {
            const { data } = await supabase
                .from("client_tasks")
                .select("due_date")
                .eq("status", "pending")
                .gte("due_date", new Date().toISOString());
            setPendingTaskCount(data?.length || 0);
        };
        fetchPendingCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/");
        router.refresh();
    };

    return (
        <div
            className={cn(
                "flex flex-col h-full border-r bg-muted/10 p-4 space-y-4 transition-all duration-300 ease-in-out shrink-0",
                collapsed ? "w-[72px]" : "w-64"
            )}
        >
            {/* Logo + Toggle */}
            <div className={cn("flex items-center shrink-0", collapsed ? "flex-col gap-2" : "flex-col")}>
                {!collapsed && (
                    <div className="flex flex-col items-center pt-0 pb-0 px-2 mb-0">
                        <img
                            src="/logo-papia.png"
                            alt="Papia Technology Solutions"
                            className="h-48 w-auto object-contain mix-blend-multiply brightness-90 contrast-125 transition-all"
                        />
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn(
                        "text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all rounded-xl",
                        collapsed ? "h-10 w-10 p-0 mx-auto" : "h-8 self-end -mt-2 mb-1"
                    )}
                    title={collapsed ? "Expandir menú" : "Colapsar menú"}
                >
                    {collapsed ? (
                        <PanelLeft className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const isTaskItem = item.href === "/dashboard/tasks";
                    const showBadge = isTaskItem && pendingTaskCount > 0;

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                type="button"
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full transition-all relative",
                                    collapsed ? "justify-center px-0" : "justify-start",
                                    isActive && "bg-secondary text-primary font-medium"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <div className="relative">
                                    <Icon className={cn("h-4 w-4 shrink-0", !collapsed && "mr-2")} />
                                    {showBadge && collapsed && (
                                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-1 shadow-sm animate-pulse">
                                            {pendingTaskCount > 99 ? "99+" : pendingTaskCount}
                                        </span>
                                    )}
                                </div>
                                {!collapsed && (
                                    <>
                                        <span className="truncate flex-1 text-left">{item.label}</span>
                                        {showBadge && (
                                            <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black px-1.5 shadow-sm ml-auto">
                                                {pendingTaskCount > 99 ? "99+" : pendingTaskCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="pt-4 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "w-full text-muted-foreground hover:text-destructive transition-all",
                        collapsed ? "justify-center px-0" : "justify-start"
                    )}
                    onClick={handleSignOut}
                    title={collapsed ? "Sign Out" : undefined}
                >
                    <LogOut className={cn("h-4 w-4 shrink-0", !collapsed && "mr-2")} />
                    {!collapsed && "Sign Out"}
                </Button>
            </div>
        </div>
    );
}
