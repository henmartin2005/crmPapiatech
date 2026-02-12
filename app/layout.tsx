import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Papia Technology Solutions LLC",
  description: "Sistema de Gestión de Pacientes - Papia Technology Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-inter`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
