import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  base: "/navigator/",
  build: {
    outDir: path.resolve(__dirname, "../Server/public/navigator"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/data": "http://localhost:8000"
    }
  }
});