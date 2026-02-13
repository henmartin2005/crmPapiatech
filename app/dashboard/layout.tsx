"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { DashboardShell } from "@/components/layout/Shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        const check = async () => {
            const { data } = await supabase.auth.getSession();
            const session = data.session;

            if (!session) {
                // si no hay sesión, sacalo de /dashboard
                router.replace("/");
                return;
            }

            if (mounted) setReady(true);
        };

        check();

        // opcional: si la sesión cambia (logout en otra pestaña), lo saca
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && pathname.startsWith("/dashboard")) {
                router.replace("/");
            }
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, [router, pathname]);

    if (!ready) {
        return <div className="p-6 text-center mt-20 font-jakarta">Loading dashboard...</div>;
    }

    return (
        <DashboardShell>
            {children}
        </DashboardShell>
    );
}

