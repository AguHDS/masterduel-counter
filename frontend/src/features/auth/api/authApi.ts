import { axiosClient } from "@/lib/http";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  turnstileToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>("/api/auth/login", {
    user: credentials.username,
    password: credentials.password,
  });
  return response.data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterResponse>("/api/auth/register", {
    user: credentials.username,
    email: credentials.email,
    password: credentials.password,
    turnstileToken: credentials.turnstileToken,
  });
  return response.data;
};
