export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangeUsernameRequest {
  username: string;
}

export interface ChangeUsernameResponse {
  success: boolean;
  message: string;
  username: string;
  nextAllowedChangeAt?: string;
}

export type ConfigurationTab = "account" | "username";
