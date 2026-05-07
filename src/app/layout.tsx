/* layout.tsx — Layout raiz con StatusBar, Sidebar y BottomNav */
import type { Metadata } from "next";
import "./globals.css";
import "@/lib/fontawesome";
import StatusBar from "@/components/layout/StatusBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "GFDAS - MagDrone Data Interface",
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
        
        {/* Contenido principal con offsets del StatusBar, Sidebar y BottomNav */}
        <main className="
          pt-16 pb-[72px]
          lg:pl-[260px] lg:pb-0
          min-h-screen
        ">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
