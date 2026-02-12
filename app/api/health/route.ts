import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Intentar conectar a la BD
        await prisma.$connect();
        // Contar usuarios para verificar lectura
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: "ok",
            database: "connected",
            userCount: userCount,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Health Check Error:", error);
        return NextResponse.json({
            status: "error",
            database: "disconnected",
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
