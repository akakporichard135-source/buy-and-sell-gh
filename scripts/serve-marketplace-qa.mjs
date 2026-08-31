import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Isolated localhost workflow: no environment files, remote database, or production credentials.
const server = await createServer({
  configFile: false,
  envFile: false,
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(""),
    "import.meta.env.VITE_ENABLE_LOCAL_ADMIN": JSON.stringify("true"),
    "import.meta.env.VITE_LOCAL_ADMIN_EMAIL": JSON.stringify("catalogue-qa@example.test"),
    "import.meta.env.VITE_LOCAL_ADMIN_PASSWORD": JSON.stringify("Local-Catalogue-QA-Only-2026"),
  },
  plugins: [react(), tailwindcss(), {
    name: "isolated-marketplace-fixtures",
    transformIndexHtml(html) {
      return html.replace('src="/src/main.tsx"', 'src="/scripts/marketplace-qa-entry.ts"');
    },
  }],
  server: { host: "127.0.0.1", port: 4192, strictPort: true },
});
await server.listen();
server.printUrls();
