export interface UserSession {
  user: string;
  email: string;
  password: string;
}

export interface UserAndPassword {
  user: string;
  password: string;
}

export interface BaseUserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export type UserId = string;
