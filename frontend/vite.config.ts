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
            "img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            isDevelopment
              ? "connect-src 'self' http://localhost:3001 http://localhost:5173 ws://localhost:5173 https://db.ygoprodeck.com"
              : "connect-src 'self' https://masterduelcounter.com https://*.masterduelcounter.com https://db.ygoprodeck.com",
            "font-src 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; ");

          return html.replace(
            "</head>",
            `<meta http-equiv="Content-Security-Policy" content="${cspDirectives}">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    </head>`
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
