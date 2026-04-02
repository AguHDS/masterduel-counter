import dotenv from "dotenv";

dotenv.config();

interface EnvironmentVars {
  portFrontend: number;
  portBackend: number;
  nodeEnv: string;
  jwtSecret: string;
  betterAuthSecret: string;
  cloudinaryName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFromName: string;
  smtpFromEmail: string;
  discordClientId: string;
  discordClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  cleanupUnverifiedAccountsEnabled?: boolean;
  unverifiedAccountTTLHours?: number;
  cleanupCronSchedule?: string;
}

const config: EnvironmentVars = {
  portFrontend: parseInt(process.env.PORT_FRONTEND || "5173", 10),
  portBackend: parseInt(process.env.PORT_BACKEND || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  cloudinaryName: process.env.CLOUDINARY_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "",
  discordClientId: process.env.DISCORD_CLIENT_ID || "",
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  cleanupUnverifiedAccountsEnabled: process.env.CLEANUP_UNVERIFIED_ACCOUNTS_ENABLED === "true",
  unverifiedAccountTTLHours: process.env.UNVERIFIED_ACCOUNT_TTL_HOURS 
    ? parseInt(process.env.UNVERIFIED_ACCOUNT_TTL_HOURS, 10) 
    : undefined,
  cleanupCronSchedule: process.env.CLEANUP_CRON_SCHEDULE || undefined,
};

export default config;