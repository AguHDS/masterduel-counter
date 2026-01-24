import { DatabasePort, createYugiohDatabase } from "@/database/database";
import { SqliteArchetypeRepository } from "@/infrastructure/repositories/SqliteArchetypeRepository";
import { SqliteAdminRepository } from "@/infrastructure/repositories/SqliteAdminRepository";
import { ArchetypeService } from "@/application/services/ArchetypeService";
import { AuthServiceImpl } from "@/application/services/AuthService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { AdminRepository } from "@/domain/ports/AdminRepository";
import { AuthService } from "@/application/ports/AuthService";

export class Dependencies {
  private database: DatabasePort;
  private archetypeRepository: ArchetypeRepository | null = null;
  private adminRepository: AdminRepository | null = null;
  private archetypeService: ArchetypeService | null = null;
  private authService: AuthService | null = null;

  constructor() {
    this.database = createYugiohDatabase();
  }

  getArchetypeRepository(): ArchetypeRepository {
    if (!this.archetypeRepository) {
      this.archetypeRepository = new SqliteArchetypeRepository(
        this.database.getConnection(),
      );
    }
    return this.archetypeRepository;
  }

  getAdminRepository(): AdminRepository {
    if (!this.adminRepository) {
      this.adminRepository = new SqliteAdminRepository(
        this.database.getConnection(),
      );
    }
    return this.adminRepository;
  }

  getArchetypeService(): ArchetypeService {
    if (!this.archetypeService) {
      this.archetypeService = new ArchetypeService(
        this.getArchetypeRepository(),
      );
    }
    return this.archetypeService;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthServiceImpl(
        this.getAdminRepository(),
      );
    }
    return this.authService;
  }

  getDatabase(): DatabasePort {
    return this.database;
  }

  close(): void {
    this.database.close();
  }
}

// Singleton instance
let dependenciesInstance: Dependencies | null = null;

export const getDependencies = (): Dependencies => {
  if (!dependenciesInstance) {
    dependenciesInstance = new Dependencies();
  }
  return dependenciesInstance;
};

export const initializeDependencies = (): void => {
  dependenciesInstance = new Dependencies();
};
