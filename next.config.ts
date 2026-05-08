import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que la app se sirva con hot-reload desde esta IP en la red local
  allowedDevOrigins: ['192.168.1.198'],
} as NextConfig;

export default nextConfig;
