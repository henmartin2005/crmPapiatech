import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const email = "admin@papiatech.com";

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists", user: existingUser });
        }

        const password = await bcrypt.hash("admin123", 10);

        const user = await prisma.user.create({
            data: {
                email,
                name: "Admin User",
                password,
                role: "ADMIN",
            },
        });

        return NextResponse.json({ message: "User created", user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
    }
}
