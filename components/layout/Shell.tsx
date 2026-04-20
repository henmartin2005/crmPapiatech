"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Responsive logic
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 768;
            const tablet = width >= 768 && width < 1280;
            
            setIsMobile(mobile);
            
            // Auto-collapse on tablet, expand on desktop (unless preference saved)
            if (tablet) {
                setCollapsed(true);
            } else if (!mobile) {
                const saved = localStorage.getItem("sidebar-collapsed");
                setCollapsed(saved === "true");
            }

            if (!mobile) setMobileMenuOpen(false);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleToggle = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-collapsed", String(next));
            return next;
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/50 relative">
            {/* Mobile Overlay */}
            {isMobile && mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop/Tablet or Mobile drawer */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[50] transition-all duration-300 lg:relative",
                isMobile ? (mobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
            )}>
                <Sidebar 
                    collapsed={isMobile ? false : collapsed} 
                    onToggle={isMobile ? () => setMobileMenuOpen(false) : handleToggle} 
                />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden flex flex-col min-w-0">
                {/* Top Header for Mobile */}
                <header className="h-14 border-b border-slate-100 bg-white flex items-center px-4 shrink-0 lg:hidden justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-orange-primary rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-black text-xs">P</span>
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight">Papiatech</span>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="h-9 w-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 hover:text-orange-primary transition-all"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className={cn(
                        "mx-auto w-full",
                        "p-4 md:p-6 lg:p-8", // Fluid padding
                        "max-w-[1600px]"
                    )}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
