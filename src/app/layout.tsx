/* layout.tsx — Layout raiz con StatusBar, Sidebar y BottomNav */
import type { Metadata } from "next";
import "./globals.css";
import "@/lib/fontawesome";
import StatusBar from "@/components/layout/StatusBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import HardwareProjectModal from "@/components/ui/HardwareProjectModal";

export const metadata: Metadata = {
  title: "GFDAS - DAX",
  description: "Sistema de interfaz de datos magnetometricos para operaciones de dron. Visualizacion de telemetria, control de adquisicion y gestion de vuelos.",
  keywords: "magnetometria, dron, GFDAS, HMI, telemetria, datos geofisicos, mapa de calor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter bg-[#F8F9FA] text-[#001F2D] antialiased">
        <StatusBar />
        <Sidebar />
        <BottomNav />
        <HardwareProjectModal />

        {/* Contenido principal con offsets del StatusBar, Sidebar y BottomNav */}
        <main className="
          pt-14 sm:pt-16 pb-24 lg:pb-8
          lg:pl-[260px]
          min-h-[100dvh]
        ">
          <div className="p-3 sm:p-5 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
