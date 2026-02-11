export interface AdminBanRequest {
  reason: string;
  expiresAt?: string | null; // ISO date string or null for permanent ban
}

export interface AdminBanResponse {
  success: boolean;
  message?: string;
  error?: string;
}