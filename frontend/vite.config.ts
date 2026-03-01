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
          const cspDirectives = [
            "default-src 'self'",
            "img-src 'self' data: https: blob:",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com blob:",
            "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
            isDevelopment
              ? "connect-src 'self' http://localhost:3001 http://localhost:5173 ws://localhost:5173 https://db.ygoprodeck.com https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io"
              : "connect-src 'self' https://masterduelcounter.com https://*.masterduelcounter.com https://db.ygoprodeck.com https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
            "font-src 'self' https://challenges.cloudflare.com",
            "object-src 'none'",
            "frame-src 'self' https://challenges.cloudflare.com",
            "base-uri 'self'",
            "form-action 'self' https://discord.com https://discordapp.com",
            "child-src 'self' https://challenges.cloudflare.com blob:",
            "worker-src 'self' blob:",
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
