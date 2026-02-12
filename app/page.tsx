import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="px-4 lg:px-6 h-20 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-3" href="/">
          <Image
            src="/logo-papia.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-sm"
          />
          <span className="font-bold text-lg md:text-xl text-slate-800 tracking-tight">
            Papia Technology Solutions LLC
          </span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
          <Link className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors" href="#">
            Características
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors" href="#">
            Precios
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors" href="#">
            Soporte
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-white via-slate-50 to-purple-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Gestión de Pacientes Simplificada
                </h1>
                <p className="mx-auto max-w-[800px] text-slate-500 md:text-xl font-medium leading-relaxed">
                  Optimiza el flujo de trabajo de tu clínica. Seguimiento de leads, gestión de citas y automatización con la tecnología de Papia Technology Solutions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 shadow-xl shadow-purple-200 transition-all active:scale-95">
                    Ingresar al Sistema <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Leads</h2>
                <p className="text-center text-slate-500 font-medium leading-relaxed">
                  Visualiza tus pacientes en un tablero Kanban intuitivo. Nunca pierdas el rastro de un prospecto y aumenta tu conversión.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Automatización</h2>
                <p className="text-center text-slate-500 font-medium leading-relaxed">
                  Conexión directa con n8n para automatizar correos, mensajes y tareas repetitivas. Ahorra tiempo y recursos.
                </p>
              </div>
              <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Seguro y Privado</h2>
                <p className="text-center text-slate-500 font-medium leading-relaxed">
                  Acceso basado en roles y cifrado de datos empresarial para mantener la información de tus pacientes siempre protegida.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-slate-50">
        <p className="text-sm font-medium text-slate-500">© 2026 Papia Technology Solutions LLC. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-6">
          <Link className="text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
