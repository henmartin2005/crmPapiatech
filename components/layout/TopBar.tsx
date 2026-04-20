"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export function TopBar() {
    const pathname = usePathname();
    
    // Get title from pathname
    const getTitle = () => {
        const segments = pathname.split("/");
        const last = segments[segments.length - 1];
        if (last === "dashboard") return "Overview";
        return last.charAt(0).toUpperCase() + last.slice(1);
    };

    // Dynamic buttons based on page
    const renderButtons = () => {
        if (pathname === "/dashboard") {
            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-semibold text-text-secondary">
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                    </Button>
                    <Button size="sm" className="h-8 bg-orange-primary hover:bg-orange-dark text-white rounded-xl text-[11px] font-semibold px-4">
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> New Lead
                    </Button>
                </div>
            );
        }
        
        if (pathname === "/dashboard/clients") {
            return (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-orange-primary/30 text-orange-primary hover:bg-orange-light rounded-xl text-[11px] font-semibold px-4">
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Pipeline
                    </Button>
                    <Button size="sm" className="h-8 bg-orange-primary hover:bg-orange-dark text-white rounded-xl text-[11px] font-semibold px-4">
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> New Lead
                    </Button>
                </div>
            );
        }

        // Default or other pages
        return (
            <Button size="sm" className="h-8 bg-orange-primary hover:bg-orange-dark text-white rounded-xl text-[11px] font-semibold px-4">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New
            </Button>
        );
    };

    return (
        <div className="h-12 border-b border-border-primary bg-white flex items-center justify-between px-6 shrink-0 z-20">
            <h1 className="text-[13.5px] font-semibold text-text-main">
                {getTitle()}
            </h1>
            
            <div className="flex items-center gap-4">
                {renderButtons()}
            </div>
        </div>
    );
}
