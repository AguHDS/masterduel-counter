import { DatabasePort, createYugiohDatabase } from "@/database/database";
import { SqliteArchetypeRepository } from "@/infrastructure/repositories/SqliteArchetypeRepository";
import { ArchetypeService } from "@/application/services/ArchetypeService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";

export class Dependencies {
  private database: DatabasePort;
  private archetypeRepository: ArchetypeRepository | null = null;
  private archetypeService: ArchetypeService | null = null;

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

  getArchetypeService(): ArchetypeService {
    if (!this.archetypeService) {
      this.archetypeService = new ArchetypeService(
        this.getArchetypeRepository(),
      );
    }
    return this.archetypeService;
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
