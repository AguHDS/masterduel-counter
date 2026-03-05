import { User } from "../User.js";

export interface UserRepository {
  /** Find User by its username */
  findUserByUsername(username: string): Promise<User | null>;
  /** Find User by its ID */
  findUserById(id: string): Promise<User | null>;
  /** Check if username and email are taken */
  isNameOrEmailTaken(
    username: string,
    email: string,
  ): Promise<{
    isTaken: boolean;
    userTaken: boolean;
    emailTaken: boolean;
  }>;
}

