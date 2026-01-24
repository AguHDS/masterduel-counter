import { Admin } from "../Admin";

export interface AdminRepository {
  findByUsername(username: string): Promise<Admin | null>;
}
