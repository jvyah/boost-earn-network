import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // Fix pour l'écran blanc sur GitHub
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173, // Fix pour l'erreur PORT de Replit
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
  },
});
