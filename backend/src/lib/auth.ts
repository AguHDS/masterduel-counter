import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import config from "@/infrastructure/config/environmentVars";
import { getFrontendUrl } from "@/infrastructure/config/urlHelpers";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",

    sendVerificationEmail: async (params: {
      user: any;
      url: string;
      token: string;
    }) => {
      const { user, url, token } = params;
      console.log(`Verification email for: ${user.email}`);
      console.log(`BetterAuth URL: ${url}`);
      console.log(`Token: ${token}`);

      const frontendUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

      console.log(`🎯 Frontend verification URL: ${frontendUrl}`);

      // Log SMTP config for debugging
      console.log(`Email will be sent via Brevo SMTP:`);
      console.log(
        `   - SMTP Host: ${process.env.SMTP_HOST || "Not configured"}`,
      );
      console.log(
        `   - From: ${process.env.SMTP_FROM_EMAIL || "Not configured"}`,
      );

      // BetterAuth handles the actual email sending automatically
      // using the 'email' configuration below
    },

    sendResetPassword: async (params: {
      user: any;
      url: string;
      token: string;
    }) => {
      const { user, url, token } = params;
      console.log(`Password reset email for: ${user.email}`);
      console.log(`BetterAuth URL: ${url}`);
      console.log(`Token: ${token}`);

      const frontendUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

      console.log(`Frontend URL (for your app): ${frontendUrl}`);

      // Additional log for debugging the actual sending
      console.log(`Email will be sent by BetterAuth using:`);
      console.log(
        `   - SMTP Host: ${process.env.SMTP_HOST || "Not configured"}`,
      );
      console.log(
        `   - From: ${process.env.SMTP_FROM_EMAIL || "Not configured"}`,
      );

      // Do NOT return anything - BetterAuth handles sending automatically
      // The SMTP configuration in the 'email' object will be used automatically
    },

    onPasswordReset: async (params: { user: any }) => {
      const { user } = params;
      console.log(`✅ Password reset completed for user: ${user.email}`);
    },
  },

  email: {
    // Use environment variables directly
    from: process.env.SMTP_FROM_EMAIL
      ? `masterduelcounter <${process.env.SMTP_FROM_EMAIL}>`
      : "masterduelcounter <noreply@masterduelcounter.com>",

    server: {
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // 587 uses STARTTLS, not direct SSL
      auth: {
        user: process.env.SMTP_USER || "test@ethereal.email",
        pass: process.env.SMTP_PASSWORD || "test123",
      },
    },

    // Additional configuration for better deliverability
    tls: {
      rejectUnauthorized: false, // Useful for development/auto-signed certificates
    },
  },

  trustedOrigins: [
    getFrontendUrl(),
    config.nodeEnv === "production" ? "https://masterduelcounter.com" : null,
  ].filter(Boolean) as string[],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },

  advanced: {
    useSecureCookies: config.nodeEnv === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
  ],
});

export type Auth = typeof auth;
