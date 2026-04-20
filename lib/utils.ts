import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function adjustColor(hex: string, amount: number) {
  return '#' + hex.replace(/^#/, '').replace(/../g, hex => ('00' + Math.min(255, Math.max(0, parseInt(hex, 16) + amount)).toString(16)).slice(-2));
}

export function getLightColor(hex: string) {
  // Simple heuristic for lightening: move towards white
  return adjustColor(hex, 200);
}

export function getDarkColor(hex: string) {
  // Simple heuristic for darkening: move towards black
  return adjustColor(hex, -80);
}

const STATUS_MAP: Record<string, string> = {
  "NEW": "NEW LEAD",
  "CONTACTED": "CONVERSATION",
  "PROPOSAL_SENT": "PROPOSAL",
  "PAYMENT_INITIAL": "INITIAL PAYMENT",
  "ACTIVE": "TREATMENT",
  "INACTIVE": "INACTIVE"
};

export function normalizeStatus(status: string) {
  if (!status) return "NEW LEAD";
  const upper = status.toUpperCase();
  return STATUS_MAP[upper] || upper;
}
