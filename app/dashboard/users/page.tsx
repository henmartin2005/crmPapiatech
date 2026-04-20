"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { 
    Users, 
    UserPlus, 
    Shield, 
    ShieldCheck, 
    MoreHorizontal,
    Search,
    Loader2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Profile = {
    id: string;
    email: string;
    role: string;
    created_at: string;
    full_name?: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch from profiles table
            const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
            if (!error && data) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(search.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-primary" /> Gestión de Equipo
                    </h1>
                    <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                        Controla el acceso y roles de los colaboradores
                    </p>
                </div>
                <Button className="h-9 px-4 rounded-xl bg-orange-primary text-white text-[11px] font-bold hover:bg-orange-dark shadow-sm gap-2">
                    <UserPlus className="h-3.5 w-3.5" /> Invitar Miembro
                </Button>
            </div>

            <div className="bg-white border border-border-primary rounded-[22px] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border-primary flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-placeholder group-focus-within:text-orange-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-9 bg-[#fafaf9] border-border-primary rounded-xl text-[11px] focus-visible:ring-orange-primary/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border-primary">
                                <TableHead className="text-[9.5px] font-bold text-text-placeholder uppercase tracking-wider px-6">Miembro</TableHead>
                                <TableHead className="text-[9.5px] font-bold text-text-placeholder uppercase tracking-wider px-6">Rol / Permisos</TableHead>
                                <TableHead className="text-[9.5px] font-bold text-text-placeholder uppercase tracking-wider px-6">Estado</TableHead>
                                <TableHead className="text-[9.5px] font-bold text-text-placeholder uppercase tracking-wider px-6 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-orange-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="group hover:bg-orange-light/30 border-b border-border-primary/50 transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-orange-light flex items-center justify-center text-[11px] font-bold text-orange-primary">
                                                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-semibold text-text-main">{user.full_name || "Sin nombre"}</span>
                                                    <span className="text-[10px] text-text-placeholder">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {user.role === "super_admin" ? (
                                                    <Badge className="bg-orange-primary text-white border-none text-[9px] font-bold uppercase py-0.5 px-2">
                                                        <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Super Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-text-secondary border-border-primary text-[9px] font-bold uppercase py-0.5 px-2">
                                                        <Shield className="h-2.5 w-2.5 mr-1" /> {user.role}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                                                <span className="text-[10.5px] font-medium text-text-secondary">Activo</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-text-placeholder hover:text-orange-primary">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center text-[11px] text-text-placeholder uppercase">
                                        No se encontraron miembros.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
