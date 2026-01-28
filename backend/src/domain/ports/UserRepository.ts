import { User } from "../User";

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  isNameOrEmailTaken(
    username: string,
    email: string,
  ): Promise<{
    isTaken: boolean;
    userTaken: boolean;
    emailTaken: boolean;
  }>;
  deleteUserById(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUserCredentials(
    id: string,
    updates: { username?: string; email?: string },
  ): Promise<User>;
}
