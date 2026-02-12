import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Mock stats
    const stats = [
        { title: "Pacientes Totales", value: "124", icon: Users, description: "+4 nuevos esta semana", color: "text-blue-500" },
        { title: "Seguimientos Pendientes", value: "12", icon: Clock, description: "3 urgentes", color: "text-orange-500" },
        { title: "Citas Programadas", value: "8", icon: Calendar, description: "Para los próximos 7 días", color: "text-green-500" },
        { title: "Tasa de Conversión", value: "24%", icon: TrendingUp, description: "+2.5% vs mes anterior", color: "text-purple-500" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Bienvenido de nuevo, {session.user?.name}. Aquí tienes un resumen de la actividad.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Nuevo lead registrado</p>
                                        <p className="text-xs text-muted-foreground">Juan Pérez se registró desde Facebook Ads.</p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">Hace {i}h</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Próximas Citas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="flex flex-col items-center bg-muted p-2 rounded w-14">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">OCT</span>
                                        <span className="text-xl font-bold">{24 + i}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Consulta General</p>
                                        <p className="text-xs text-muted-foreground">Maria Garcia • 10:00 AM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
