"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    // Persist preference in localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved === "true") setCollapsed(true);
    }, []);

    const handleToggle = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-collapsed", String(next));
            return next;
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar collapsed={collapsed} onToggle={handleToggle} />
            <main className="flex-1 overflow-hidden flex flex-col p-4 pb-0">
                {children}
            </main>
        </div>
    );
}
