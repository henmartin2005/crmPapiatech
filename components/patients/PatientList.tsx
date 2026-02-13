import { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    ArrowUpDown,
    Loader2,
    Instagram,
    Facebook,
    MessageCircle,
    Tag,
    User,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export type Patient = {
    id: string;
    name: string;
    status: string;
    email: string;
    phone: string;
    service: string;
    created_at: string;
    source: string;
};

const getSourceIcon = (source: string) => {
    switch (source) {
        case "WhatsApp": return <MessageCircle className="h-4 w-4 text-green-500" />;
        case "Instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
        case "Facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
        default: return <Tag className="h-4 w-4 text-slate-400" />;
    }
};

export const columns: ColumnDef<Patient>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent font-black uppercase text-[10px] tracking-wider p-0 h-auto"
                >
                    Nombre del Cliente
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                    <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-bold text-slate-700">{row.getValue("name")}</span>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusMap: Record<string, { label: string, color: string }> = {
                "NEW": { label: "Nuevo Contacto", color: "bg-purple-50 text-purple-600 border-purple-100" },
                "CONTACTED": { label: "Conversación", color: "bg-blue-50 text-blue-600 border-blue-100" },
                "PROPOSAL_SENT": { label: "Presupuesto", color: "bg-amber-50 text-amber-600 border-amber-100" },
                "PAYMENT_INITIAL": { label: "Pago Inicial", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                "ACTIVE": { label: "Tratamiento", color: "bg-pink-50 text-pink-600 border-pink-100" },
                "INACTIVE": { label: "Inactivo", color: "bg-slate-50 text-slate-600 border-slate-100" },
            };
            const config = statusMap[status] || { label: status, color: "bg-slate-50 text-slate-500" };

            return (
                <Badge variant="outline" className={`rounded-lg font-black text-[9px] uppercase tracking-wider py-0.5 px-2 ${config.color}`}>
                    {config.label}
                </Badge>
            );
        }
    },
    {
        accessorKey: "phone",
        header: "Contacto",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <div className="text-xs font-bold text-slate-700">{row.original.phone}</div>
                <div className="text-[10px] font-medium text-slate-400">{row.original.email}</div>
            </div>
        )
    },
    {
        accessorKey: "source",
        header: "Fuente",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {getSourceIcon(row.original.source)}
                <span className="text-[11px] font-bold text-slate-600">{row.original.source}</span>
            </div>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const patient = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(patient.phone);
                            }}
                            className="rounded-lg font-semibold text-sm"
                        >
                            <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Copiar Teléfono</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg font-semibold text-sm">
                            <span className="flex items-center gap-2"><ArrowUpDown className="h-3.5 w-3.5" /> Ver Historial</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function PatientTable({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
    const [data, setData] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const fetchPatients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            setData(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPatients();

        const channel = supabase
            .channel("list_changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => {
                fetchPatients();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por nombre..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm rounded-xl"
                />
            </div>
            <div className="rounded-2xl border overflow-hidden shadow-sm bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onSelectPatient(row.original.id)}
                                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
