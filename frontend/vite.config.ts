import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [
      react(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          // Security headers via meta tags (CSP)
          const cspDirectives = [
            "default-src 'self'",
            "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.ygoprodeck.com https://*.ygoprodeck.com https://ygoprodeck.com",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
            isDevelopment
              ? "connect-src 'self' http://localhost:3001 http://localhost:5173 ws://localhost:5173 https://db.ygoprodeck.com https://challenges.cloudflare.com"
              : "connect-src 'self' https://masterduelcounter.com https://*.masterduelcounter.com https://db.ygoprodeck.com https://challenges.cloudflare.com",
            "font-src 'self' https://challenges.cloudflare.com",
            "object-src 'none'",
            "frame-src 'self' https://challenges.cloudflare.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "child-src 'self' https://challenges.cloudflare.com",
            // WebSocket para desarrollo
            ...(isDevelopment ? ["ws-src ws://localhost:5173 'self'"] : []),
          ]
            .filter(Boolean)
            .join("; ");

          return html.replace(
            "</head>",
            `<meta http-equiv="Content-Security-Policy" content="${cspDirectives}">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    </head>`,
          );
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
