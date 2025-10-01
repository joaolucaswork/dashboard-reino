import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  optimizeDeps: {
    include: ["svelte-sonner"],
  },
  ssr: {
    noExternal: ["svelte-sonner"],
  },
  server: {
    host: "127.0.0.1",
    port: 3002,
  },
});
