"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createLeadAction(formData: {
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    source?: string;
    status: string;
    estimated_budget: string;
    project_value: number;
}) {
    try {
        const supabase = await createServerSupabaseClient();
        
        // Confirm user session on server side
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Sesión expirada o inválida. Por favor inicia sesión de nuevo." };
        }

        const { error } = await supabase.from("clients").insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]);

        if (error) {
            console.error("DB Error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (err: any) {
        console.error("Server Action Error:", err);
        return { success: false, error: "Ocurrió un error inesperado en el servidor." };
    }
}

export async function updateClientAction(id: string, updates: Partial<{
    name: string;
    email: string;
    phone: string;
    service: string;
    source: string;
    status: string;
    country: string;
    estimated_budget: string;
    project_value: number;
    project_description: string;
}>) {
    try {
        const supabase = await createServerSupabaseClient();
        
        // Confirm user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "Sesión expirada." };
        }

        const { error } = await supabase
            .from("clients")
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);

        if (error) {
            console.error("DB Update Error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (err: any) {
        console.error("Update Action Error:", err);
        return { success: false, error: "Error al actualizar en el servidor." };
    }
}
