"use client";

import { differenceInDays, parseISO } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InactivityBadgeProps {
  lastContactAt: string | null;
  className?: string;
}

export function InactivityBadge({ lastContactAt, className }: InactivityBadgeProps) {
  if (!lastContactAt) return null;

  const days = differenceInDays(new Date(), parseISO(lastContactAt));

  if (days < 3) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm transition-all duration-300",
      days >= 7 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : 
      days >= 5 ? "bg-orange-50 text-orange-600 border-orange-100" :
      "bg-amber-50 text-amber-600 border-amber-100",
      className
    )}>
      <Clock className="h-3 w-3" />
      <span className="text-[10px] font-black uppercase tracking-tight">
        {days} días sin contacto
      </span>
    </div>
  );
}
