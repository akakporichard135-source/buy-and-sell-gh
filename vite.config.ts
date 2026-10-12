import { defineConfig, type Plugin, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function adminHostnameGuard(): Plugin {
  const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>404 - Page Not Found | Buy &amp; Sell GH</title>
    <style>
      body { background: #000; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
      .card { background: #111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 48px 32px; max-width: 480px; width: 90%; }
      h1 { font-size: 28px; margin: 12px 0; }
      p { color: #86868b; margin-bottom: 24px; font-size: 15px; }
      a { display: inline-block; background: #d4af37; color: #000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 980px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="color: #d4af37; font-size: 13px; font-weight: 700; text-transform: uppercase;">Error 404</div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist or is not available on this address.</p>
      <a href="/">Return to Storefront</a>
    </div>
  </body>
</html>`;

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const rawReq = req as { headers?: { host?: string }; url?: string };
    const rawHost = (rawReq.headers?.host || "").toLowerCase();
    const hostname = rawHost.split(":")[0];
    const url = (rawReq.url || "").split("?")[0];

    const isAdminHost = hostname.startsWith("admin.") || hostname === "admin.localhost";
    const isAdminRoute = url === "/admin" || url.startsWith("/admin/");

    if (!isAdminHost && isAdminRoute) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(notFoundHtml);
      return;
    }

    next();
  };

  return {
    name: "admin-hostname-guard",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminHostnameGuard()],
  server: {
    allowedHosts: ["admin.localhost", "localhost", "127.0.0.1"],
  },
  preview: {
    allowedHosts: ["admin.localhost", "localhost", "127.0.0.1"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
