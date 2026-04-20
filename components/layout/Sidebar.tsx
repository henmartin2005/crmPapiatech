"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    Mail,
    Settings,
    UserCog,
    ClipboardList,
    PanelLeftClose,
    PanelLeft,
    ChevronLeft,
    ChevronRight,
    Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";

const PRINCIPAL_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/clients", icon: Users, label: "Clients", badgeColor: "bg-orange-primary" },
    { href: "/dashboard/tasks", icon: ClipboardList, label: "Tasks", badgeColor: "bg-red-500" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Appointments", badgeColor: "bg-amber-500" },
];

const GESTION_ITEMS = [
    { href: "/dashboard/email", icon: Mail, label: "Email" },
    { href: "/dashboard/services", icon: Briefcase, label: "Services" },
    { href: "/dashboard/users", icon: UserCog, label: "Users" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user, profile, isSuperAdmin } = useAuth();
    const [counts, setCounts] = useState({ tasks: 0, appointments: 0, clients: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            const { count: tasks } = await supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending");
            const { count: appointments } = await supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending");
            const { count: clients } = await supabase.from("clients").select("*", { count: "exact", head: true });
            setCounts({ tasks: tasks || 0, appointments: appointments || 0, clients: clients || 0 });
        };
        fetchCounts();
    }, []);

    const NavItem = ({ item }: { item: any }) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        
        // Get badge count
        let count = 0;
        if (item.label === "Tasks") count = counts.tasks;
        if (item.label === "Appointments") count = counts.appointments;
        if (item.label === "Clients") count = counts.clients;

        return (
            <Link 
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                    isActive 
                        ? "bg-orange-light text-orange-primary font-medium" 
                        : "text-text-secondary hover:bg-orange-light hover:text-orange-primary",
                    collapsed && "justify-center px-0"
                )}
            >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
                {!collapsed && (
                    <span className="text-[13px] font-medium truncate flex-1 uppercase tracking-tight">
                        {item.label}
                    </span>
                )}
                
                {count > 0 && item.badgeColor && (
                    <span className={cn(
                        "flex items-center justify-center rounded-full text-white text-[10px] font-black min-w-[17px] h-4.5 px-1",
                        item.badgeColor,
                        collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                    )}>
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className={cn(
            "h-full border-r border-border-primary bg-white flex flex-col transition-all duration-200 ease-in-out shrink-0 z-30",
            collapsed ? "w-[50px]" : "w-[196px]"
        )}>
            {/* Header / Logo */}
            <div className="h-12 border-b border-border-primary flex items-center px-3 justify-between shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-[26px] w-[26px] bg-orange-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <Star className="h-3.5 w-3.5 text-white fill-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-text-main leading-tight tracking-tight">Papiatech</span>
                            <span className="text-[10px] text-text-placeholder leading-none font-semibold">CRM v2</span>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <button 
                        onClick={onToggle}
                        className="h-6 w-6 rounded-md bg-[#f5f2ee] flex items-center justify-center text-text-muted hover:text-orange-primary transition-colors"
                    >
                        <PanelLeftClose className="h-3.5 w-3.5" />
                    </button>
                )}
                {collapsed && (
                    <button 
                        onClick={onToggle}
                        className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-white border border-border-primary flex items-center justify-center text-text-muted hover:text-orange-primary shadow-sm z-50"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6">
                <div>
                    {!collapsed && (
                        <h3 className="px-3 mb-2 text-[11px] font-black text-text-placeholder uppercase tracking-widest">Principal</h3>
                    )}
                    <div className="space-y-0.5">
                        {PRINCIPAL_ITEMS.map(item => <NavItem key={item.href} item={item} />)}
                    </div>
                </div>

                <div>
                    {!collapsed && (
                        <h3 className="px-3 mb-2 text-[10px] font-bold text-text-placeholder uppercase tracking-widest">Gestión</h3>
                    )}
                    <div className="space-y-0.5">
                        {GESTION_ITEMS.map(item => <NavItem key={item.href} item={item} />)}
                    </div>
                </div>
            </div>

            {/* Footer / Profile */}
            <div className="p-2 border-t border-border-primary shrink-0 bg-slate-50/50">
                <div className={cn(
                    "flex items-center gap-2 p-1.5 rounded-xl transition-colors",
                    collapsed ? "justify-center" : "bg-white border border-border-primary shadow-sm"
                )}>
                    <Avatar className={cn("h-7 w-7 border border-orange-light shrink-0", !collapsed && "shadow-sm")}>
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-orange-light text-orange-primary text-[10px] font-black">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    
                    {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[12px] font-bold text-text-main truncate leading-tight">
                                {profile?.full_name || "Usuario"}
                            </span>
                            <div className="flex items-center gap-1">
                                {isSuperAdmin ? (
                                    <span className="text-[9px] font-bold text-orange-dark bg-orange-light px-1.5 py-0.5 rounded-md leading-none">
                                        Super Admin
                                    </span>
                                ) : (
                                    <span className="text-[9px] text-text-placeholder truncate leading-none">
                                        {profile?.role || "Manager"}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
