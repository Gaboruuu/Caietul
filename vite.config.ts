import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/graphql": {
        target: "https://caietul-backend.onrender.com",
        changeOrigin: true,
      },
      "/api": {
        target: "https://caietul-backend.onrender.com",
        changeOrigin: true,
      },
      "/ws": {
        target: "wss://caietul-backend.onrender.com",
        ws: true,
        changeOrigin: true,
        rejectUnauthorized: false,
      },
    },
  },
});
