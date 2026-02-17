import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// Helper: verify the requesting user is an admin
async function verifyAdmin(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = getAdminClient();

    const {
        data: { user },
        error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return null;

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") return null;

    return user;
}

// GET — list all users with their profiles
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data });
}

// POST — create a new user
export async function POST(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    if (role && !["admin", "usuario"].includes(role)) {
        return NextResponse.json(
            { error: "Role must be 'admin' or 'usuario'" },
            { status: 400 }
        );
    }

    const supabaseAdmin = getAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Update role if specified (trigger creates profile with 'usuario' by default)
    if (role && role !== "usuario" && authData.user) {
        await supabaseAdmin
            .from("profiles")
            .update({ role })
            .eq("id", authData.user.id);
    }

    return NextResponse.json({ user: authData.user }, { status: 201 });
}

// PATCH — update user password or role
export async function PATCH(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, password, role } = body;

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        );
    }

    const supabaseAdmin = getAdminClient();

    // Update password
    if (password) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
        });
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    // Update role
    if (role) {
        if (!["admin", "usuario"].includes(role)) {
            return NextResponse.json(
                { error: "Role must be 'admin' or 'usuario'" },
                { status: 400 }
            );
        }
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({ role })
            .eq("id", userId);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    return NextResponse.json({ success: true });
}

// DELETE — delete a user
export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        );
    }

    // Prevent deleting yourself
    if (userId === admin.id) {
        return NextResponse.json(
            { error: "Cannot delete your own account" },
            { status: 400 }
        );
    }

    const supabaseAdmin = getAdminClient();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
