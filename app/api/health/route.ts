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
            env: {
                NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
                NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
                NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL || "not set",
                POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
            },
            serverTime: new Date().toISOString(),
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
