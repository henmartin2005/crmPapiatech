"use client"

import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, User as UserIcon, Loader2 } from "lucide-react"

export function UserMenu() {
  const { user, profile, loading, logout, isSuperAdmin } = useAuth()

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  }

  if (!user) return null

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none">{profile?.full_name || "Usuario"}</p>
              {isSuperAdmin && (
                <Badge className="bg-violet-600 hover:bg-violet-700 text-[10px] px-1.5 py-0">
                  Super Admin
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="cursor-not-allowed">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
