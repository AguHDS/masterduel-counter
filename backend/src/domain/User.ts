export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  role: string;
  created_at: string;
}

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserRegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}