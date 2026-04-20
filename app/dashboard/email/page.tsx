"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Send, 
    Paperclip, 
    Image as ImageIcon, 
    Smile, 
    MoreHorizontal,
    User,
    Mail,
    Layout
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailPage() {
    const [email, setEmail] = useState({
        to: "",
        subject: "",
        message: ""
    });

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-[15.5px] font-semibold text-text-main flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-primary" /> Redactar Propuesta
                </h1>
                <p className="text-[10px] text-text-placeholder font-medium uppercase tracking-wider mt-1">
                    Envía emails personalizados a tus clientes
                </p>
            </div>

            <div className="flex-1 bg-white border border-border-primary rounded-[22px] shadow-sm flex flex-col overflow-hidden">
                {/* Headers */}
                <div className="p-6 space-y-4 border-b border-border-primary/50">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-text-placeholder uppercase w-16">Para:</span>
                        <div className="flex-1 relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-placeholder group-focus-within:text-orange-primary transition-colors" />
                            <Input 
                                value={email.to}
                                onChange={(e) => setEmail({...email, to: e.target.value})}
                                placeholder="nombre@cliente.com"
                                className="h-10 pl-9 bg-[#fafaf9] border-border-primary rounded-xl text-[11.5px] font-medium focus-visible:ring-orange-primary/20"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-text-placeholder uppercase w-16">Asunto:</span>
                        <div className="flex-1">
                            <Input 
                                value={email.subject}
                                onChange={(e) => setEmail({...email, subject: e.target.value})}
                                placeholder="Propuesta de Servicios - Papia Technology"
                                className="h-10 bg-[#fafaf9] border-border-primary rounded-xl text-[11.5px] font-medium focus-visible:ring-orange-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-6 py-2 border-b border-border-primary/30 flex items-center gap-4 bg-[#fafaf9]/50">
                    <button className="p-2 rounded-lg hover:bg-white text-text-placeholder hover:text-orange-primary transition-all">
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white text-text-placeholder hover:text-orange-primary transition-all">
                        <ImageIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white text-text-placeholder hover:text-orange-primary transition-all">
                        <Smile className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-border-primary" />
                    <button className="p-2 rounded-lg hover:bg-white text-text-placeholder hover:text-orange-primary transition-all flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Plantillas</span>
                    </button>
                </div>

                {/* Composer */}
                <div className="flex-1 p-6 flex flex-col">
                    <Textarea 
                        value={email.message}
                        onChange={(e) => setEmail({...email, message: e.target.value})}
                        placeholder="Escribe tu mensaje aquí..."
                        className="flex-1 resize-none border-none focus-visible:ring-0 text-[13px] leading-relaxed text-text-main p-0 placeholder:text-text-placeholder/50"
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-primary flex items-center justify-between bg-[#fafaf9]/50">
                    <div className="flex items-center gap-2">
                         <button className="h-10 w-10 rounded-xl border border-border-primary flex items-center justify-center text-text-placeholder hover:bg-white transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="h-10 rounded-xl text-[11px] font-bold text-text-placeholder hover:text-text-main">
                            Descartar
                        </Button>
                        <Button className="h-10 px-8 rounded-xl bg-orange-primary text-white font-bold text-[11px] hover:bg-orange-dark shadow-lg shadow-orange-100 flex items-center gap-2">
                            <Send className="h-3.5 w-3.5" /> Enviar Propuesta
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
