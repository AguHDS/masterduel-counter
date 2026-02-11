export interface AdminChangeCredentialsRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface AdminChangeCredentialsResponse {
  success: boolean;
  message?: string;
  error?: string;
}