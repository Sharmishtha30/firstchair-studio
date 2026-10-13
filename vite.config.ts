import { defineConfig } from "vite";
export default defineConfig({
  server: { host: "localhost", port: 5173, strictPort: true, proxy: { "/api/reels": { target: "http://127.0.0.1:5176", changeOrigin: true } } },
  resolve: { dedupe: ["react", "react-dom"] },
  optimizeDeps: {
    include: [
      "react",
      "react-dom/client",
      "@convex-dev/auth/react",
      "convex/react",
    ],
  },
});
