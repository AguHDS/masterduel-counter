import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import config from "@/infrastructure/config/environmentVars.js";
import { getFrontendUrl, getBackendUrl } from "@/infrastructure/config/urlHelpers.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/services/emailService.js";

const prisma = new PrismaClient();

/**
 * Generates a unique username if the provided name already exists
 */
async function generateUniqueUsername(baseName: string): Promise<string> {
  let username = baseName;
  let suffix = 1;

  // Check if username exists and keep trying with incremented suffix
  while (true) {
    const existingUser = await prisma.user.findFirst({
      where: { name: username },
    });

    if (!existingUser) {
      return username;
    }

    username = `${baseName}_${suffix}`;
    suffix++;
  }
}

export const auth = betterAuth({
  baseURL: getBackendUrl(),

  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  socialProviders: {
    discord: {
      clientId: config.discordClientId,
      clientSecret: config.discordClientSecret,
      redirectURI: `${getBackendUrl()}/api/auth/callback/discord`,
      callbackURL: getFrontendUrl(),
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    autoSignIn: false,
    minPasswordLength: 5,
    sendResetPassword: async ({ user, url, token }: any) => {
      const frontendUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

      if (config.nodeEnv === "development") {
        console.log("\n===== PASSWORD RESET REQUEST (DEVELOPMENT MODE) =====");
        console.log(`User: ${user.email}`);
        console.log(`Reset URL: ${frontendUrl}`);
        console.log(`Token: ${token}`);
        console.log(`In development, copy the URL above and paste in your browser`);
        console.log("============================================\n");
      } else {
        // Send email in production
        await sendPasswordResetEmail(user.email, user.name, frontendUrl);
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }: any) => {
      const frontendUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

      if (config.nodeEnv === "development") {
        console.log("\n===== EMAIL VERIFICATION FOR SIGN UP (DEVELOPMENT MODE) =====");
        console.log(`User: ${user.email}`);
        console.log(`Verification URL: ${frontendUrl}`);
        console.log(`Token: ${token}`);
        console.log(`In development, copy the URL above and paste in your browser`);
        console.log("============================================\n");
      } else {
        // Send email in production
        await sendVerificationEmail(user.email, user.name, frontendUrl);
      }
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

  onAfterSignUp: async ({ user, account }: any) => {
    // Handle username collisions for OAuth users
    if (account && account.providerId !== "credential") {
      const userName = user.name;

      // Check if there's another user with the same name (not this user)
      const existingUser = await prisma.user.findFirst({
        where: {
          name: userName,
          id: { not: user.id },
        },
      });

      // If collision found, update this user's name
      if (existingUser) {
        const uniqueName = await generateUniqueUsername(userName);

        await prisma.user.update({
          where: { id: user.id },
          data: { name: uniqueName },
        });

        console.log(`\n USERNAME COLLISION HANDLED`);
      }
    }
  },

  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
  ],
});

export type Auth = typeof auth;
