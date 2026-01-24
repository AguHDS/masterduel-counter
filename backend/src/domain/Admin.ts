export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AdminLoginDTO {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: {
    id: number;
    username: string;
  };
}
