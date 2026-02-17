"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    UserPlus,
    KeyRound,
    Shield,
    Trash2,
    Loader2,
    Users,
    ShieldCheck,
    User,
} from "lucide-react";

type Profile = {
    id: string;
    email: string;
    role: string;
    created_at: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Dialog states
    const [showAddUser, setShowAddUser] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeRole, setShowChangeRole] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("usuario");

    const getAuthToken = async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || "";
    };

    const fetchUsers = useCallback(async () => {
        try {
            const token = await getAuthToken();
            const res = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            } else {
                // If not admin, just show limited info
                setUsers([]);
            }
        } catch {
            setError("Error loading users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setCurrentUserId(data.user.id);
                // Get current user's role
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();
                setCurrentUserRole(profile?.role || "usuario");
            }
            await fetchUsers();
        };
        init();
    }, [fetchUsers]);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const showMessage = (msg: string, isError = false) => {
        if (isError) {
            setError(msg);
            setSuccess(null);
        } else {
            setSuccess(msg);
            setError(null);
        }
        setTimeout(() => { setError(null); setSuccess(null); }, 4000);
    };

    // ---------- CREATE USER ----------
    const handleCreateUser = async () => {
        if (!newEmail || !newPassword) return;
        setActionLoading(true);
        clearMessages();

        try {
            const token = await getAuthToken();
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
            });
            const data = await res.json();

            if (!res.ok) {
                showMessage(data.error || "Error creating user", true);
            } else {
                showMessage(`Usuario ${newEmail} creado exitosamente`);
                setShowAddUser(false);
                setNewEmail("");
                setNewPassword("");
                setNewRole("usuario");
                await fetchUsers();
            }
        } catch {
            showMessage("Error de conexión", true);
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- CHANGE PASSWORD ----------
    const handleChangePassword = async () => {
        if (!selectedUser || !newPassword) return;
        setActionLoading(true);
        clearMessages();

        try {
            const token = await getAuthToken();
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: selectedUser.id, password: newPassword }),
            });
            const data = await res.json();

            if (!res.ok) {
                showMessage(data.error || "Error changing password", true);
            } else {
                showMessage(`Contraseña de ${selectedUser.email} actualizada`);
                setShowChangePassword(false);
                setNewPassword("");
                setSelectedUser(null);
            }
        } catch {
            showMessage("Error de conexión", true);
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- CHANGE ROLE ----------
    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;
        setActionLoading(true);
        clearMessages();

        try {
            const token = await getAuthToken();
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: selectedUser.id, role: newRole }),
            });
            const data = await res.json();

            if (!res.ok) {
                showMessage(data.error || "Error changing role", true);
            } else {
                showMessage(`Rol de ${selectedUser.email} actualizado a ${newRole}`);
                setShowChangeRole(false);
                setNewRole("usuario");
                setSelectedUser(null);
                await fetchUsers();
            }
        } catch {
            showMessage("Error de conexión", true);
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- DELETE USER ----------
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        clearMessages();

        try {
            const token = await getAuthToken();
            const res = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
                showMessage(data.error || "Error deleting user", true);
            } else {
                showMessage(`Usuario ${selectedUser.email} eliminado`);
                setShowDeleteConfirm(false);
                setSelectedUser(null);
                await fetchUsers();
            }
        } catch {
            showMessage("Error de conexión", true);
        } finally {
            setActionLoading(false);
        }
    };

    const isAdmin = currentUserRole === "admin";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight font-jakarta flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-600" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {isAdmin
                            ? "Administra los usuarios y sus roles en el sistema."
                            : "Vista de usuarios del sistema."}
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setShowAddUser(true)}
                        className="bg-gradient-to-r from-[#7C3AED] to-[#E91E90] text-white hover:opacity-90 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Agregar Usuario
                    </Button>
                )}
            </div>

            {/* Messages */}
            {error && (
                <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 text-red-600 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert className="rounded-2xl border-none bg-emerald-50 text-emerald-600 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertDescription className="font-bold">{success}</AlertDescription>
                </Alert>
            )}

            {/* Users Table */}
            <Card className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="font-jakarta font-bold">
                        Usuarios Registrados ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Email</TableHead>
                                <TableHead className="font-bold">Rol</TableHead>
                                <TableHead className="font-bold">Fecha de Creación</TableHead>
                                {isAdmin && <TableHead className="font-bold text-right">Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.role === "admin" ? "default" : "secondary"}
                                            className={
                                                user.role === "admin"
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none font-bold"
                                                    : "bg-slate-100 text-slate-700 border-none font-bold"
                                            }
                                        >
                                            {user.role === "admin" ? (
                                                <ShieldCheck className="mr-1 h-3 w-3" />
                                            ) : (
                                                <User className="mr-1 h-3 w-3" />
                                            )}
                                            {user.role === "admin" ? "Admin" : "Usuario"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewPassword("");
                                                        setShowChangePassword(true);
                                                    }}
                                                    title="Cambiar contraseña"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setShowChangeRole(true);
                                                    }}
                                                    title="Cambiar rol"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>
                                                {user.id !== currentUserId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-muted-foreground">
                                        No hay usuarios registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ---- DIALOG: Add User ---- */}
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogContent className="rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta font-bold text-xl flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-purple-600" />
                            Agregar Nuevo Usuario
                        </DialogTitle>
                        <DialogDescription>
                            Crea una cuenta nueva con email y contraseña.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm">Correo Electrónico</Label>
                            <Input
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="rounded-xl h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-sm">Contraseña</Label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="rounded-xl h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-sm">Rol</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usuario">
                                        <span className="flex items-center gap-2">
                                            <User className="h-4 w-4" /> Usuario
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" /> Admin
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddUser(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateUser}
                            disabled={actionLoading || !newEmail || !newPassword}
                            className="bg-gradient-to-r from-[#7C3AED] to-[#E91E90] text-white rounded-xl font-bold"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---- DIALOG: Change Password ---- */}
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent className="rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta font-bold text-xl flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-purple-600" />
                            Cambiar Contraseña
                        </DialogTitle>
                        <DialogDescription>
                            Cambia la contraseña de <strong>{selectedUser?.email}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm">Nueva Contraseña</Label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="rounded-xl h-12"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangePassword(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={actionLoading || !newPassword}
                            className="bg-gradient-to-r from-[#7C3AED] to-[#E91E90] text-white rounded-xl font-bold"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Contraseña"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---- DIALOG: Change Role ---- */}
            <Dialog open={showChangeRole} onOpenChange={setShowChangeRole}>
                <DialogContent className="rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta font-bold text-xl flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Cambiar Rol
                        </DialogTitle>
                        <DialogDescription>
                            Cambia el rol de <strong>{selectedUser?.email}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm">Nuevo Rol</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="rounded-xl h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usuario">
                                        <span className="flex items-center gap-2">
                                            <User className="h-4 w-4" /> Usuario
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" /> Admin
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangeRole(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleChangeRole}
                            disabled={actionLoading}
                            className="bg-gradient-to-r from-[#7C3AED] to-[#E91E90] text-white rounded-xl font-bold"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Rol"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---- DIALOG: Delete Confirm ---- */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta font-bold text-xl flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que quieres eliminar a <strong>{selectedUser?.email}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteUser}
                            disabled={actionLoading}
                            variant="destructive"
                            className="rounded-xl font-bold"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
