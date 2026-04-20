"use server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function debugSchemaAction() {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from("clients").select("*").limit(1);
    if (data && data[0]) {
        console.log("CLIENTS COLUMNS:", Object.keys(data[0]));
        return { columns: Object.keys(data[0]) };
    }
    return { error: "No data found to inspect columns" };
}
