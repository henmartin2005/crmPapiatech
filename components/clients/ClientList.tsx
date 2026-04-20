"use client";

import { useEffect, useState, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn, normalizeStatus } from "@/lib/utils";
import { InactivityBadge } from "./InactivityBadge";

export type Client = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    lead_source: string;
    service: string;
    estimated_budget: string;
    last_contact_at: string;
    created_at: string;
};

export function ClientList({ onSelectClient }: { onSelectClient: (id: string) => void }) {
    const [data, setData] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pipelines, setPipelines] = useState<any[]>([]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data: clients } = await supabase
                .from("clients")
                .select("*")
                .order("created_at", { ascending: false });
            
            const { data: pData } = await supabase.from("pipelines").select("*");
            
            setData(clients || []);
            setPipelines(pData || []);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const columns = useMemo<ColumnDef<Client>[]>(() => [
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-text-main leading-none mb-1">{row.original.name}</span>
                    <span className="text-[11px] text-text-placeholder font-medium">{row.original.email || row.original.phone}</span>
                </div>
            )
        },
        {
            accessorKey: "service",
            header: "Servicio",
            cell: ({ row }) => (
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-tight">
                    {row.original.service || "—"}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: "Pipeline",
            cell: ({ row }) => {
                const statusName = normalizeStatus(row.original.status);
                const pipeline = pipelines.find(p => (p.name === statusName || p.id === statusName || p.id === row.original.status));
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pipeline?.color || "#EA580C" }} />
                        <span className="text-[12px] font-medium text-text-secondary">{statusName}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "lead_source",
            header: "Lead Source",
            cell: ({ row }) => (
                <span className="text-[10px] font-semibold text-text-placeholder uppercase">
                    {row.original.lead_source || "—"}
                </span>
            )
        },
        {
            accessorKey: "estimated_budget",
            header: "Presupuesto",
            cell: ({ row }) => (
                <span className="text-[10.5px] font-semibold text-text-main">
                    {row.original.estimated_budget || "—"}
                </span>
            )
        },
        {
            accessorKey: "last_contact_at",
            header: "Inactividad",
            cell: ({ row }) => <InactivityBadge lastContactAt={row.original.last_contact_at} />
        },
        {
            accessorKey: "created_at",
            header: "Fecha",
            cell: ({ row }) => (
                <span className="text-[11px] text-text-placeholder font-medium">
                    {row.original.created_at ? (() => {
                        try {
                            return format(new Date(row.original.created_at), "dd MMM yyyy", { locale: es });
                        } catch (e) {
                            return String(row.original.created_at).slice(0,10);
                        }
                    })() : "—"}
                </span>
            )
        }
    ], [pipelines]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-border-primary flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-placeholder group-focus-within:text-orange-primary transition-colors" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="h-9 pl-9 bg-background border-border-primary rounded-xl text-[11px] focus-visible:ring-orange-primary/20"
                    />
                </div>
                
                <Button variant="outline" size="sm" className="h-9 border-border-primary rounded-xl text-[11px] font-semibold gap-2">
                    <Filter className="h-3.5 w-3.5" /> Filtros
                </Button>
            </div>

            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border-primary">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 text-[9.5px] font-bold text-text-placeholder uppercase tracking-wider px-4">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onSelectClient(row.original.id)}
                                    className="group cursor-pointer hover:bg-orange-light/30 border-b border-border-primary/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-[11px] text-text-placeholder">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="p-4 border-t border-border-primary flex items-center justify-between shrink-0">
                <p className="text-[10px] font-medium text-text-placeholder uppercase tracking-wider">
                    Mostrando {table.getRowModel().rows.length} de {data.length} clientes
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0 rounded-lg border-border-primary"
                    >
                        <ChevronLeft className="h-4 w-4 text-text-secondary" />
                    </Button>
                    <div className="text-[11px] font-bold text-text-main px-2">
                        {table.getState().pagination.pageIndex + 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0 rounded-lg border-border-primary"
                    >
                        <ChevronRight className="h-4 w-4 text-text-secondary" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
