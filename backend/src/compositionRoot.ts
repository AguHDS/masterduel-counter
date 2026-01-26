import { DatabasePort, createYugiohDatabase } from "@/database/database";
import { SqliteArchetypeRepository } from "@/infrastructure/repositories/SqliteArchetypeRepository";
import { SqliteAdminRepository } from "@/infrastructure/repositories/SqliteAdminRepository";
import { SqliteCardRepository } from "@/infrastructure/repositories/SqliteCardRepository";
import { ArchetypeService } from "@/application/services/ArchetypeService";
import { AuthServiceImpl } from "@/application/services/AuthService";
import { CardServiceImpl } from "@/application/services/CardService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { AdminRepository } from "@/domain/ports/AdminRepository";
import { CardRepository } from "@/domain/ports/CardRepository";
import { AuthService } from "@/application/ports/AuthService";
import { CardService } from "@/application/ports/CardService";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService";
import { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService";
import { YgoProDeckApiAdapter } from "@/infrastructure/adapters/externalServices/YgoProDeckApiAdapter";
import { CloudinaryAdapter } from "@/infrastructure/adapters/externalServices/CloudinaryAdapter";

export class Dependencies {
  private database: DatabasePort;
  private archetypeRepository: ArchetypeRepository | null = null;
  private adminRepository: AdminRepository | null = null;
  private cardRepository: CardRepository | null = null;
  private archetypeService: ArchetypeService | null = null;
  private authService: AuthService | null = null;
  private cardService: CardService | null = null;
  private cardApiService: CardApiService | null = null;
  private imageStorageService: ImageStorageService | null = null;

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

  getCardRepository(): CardRepository {
    if (!this.cardRepository) {
      this.cardRepository = new SqliteCardRepository(
        this.database.getConnection(),
      );
    }
    return this.cardRepository;
  }

  getCardApiService(): CardApiService {
    if (!this.cardApiService) {
      this.cardApiService = new YgoProDeckApiAdapter();
    }
    return this.cardApiService;
  }

  getImageStorageService(): ImageStorageService {
    if (!this.imageStorageService) {
      this.imageStorageService = new CloudinaryAdapter();
    }
    return this.imageStorageService;
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

  getCardService(): CardService {
    if (!this.cardService) {
      this.cardService = new CardServiceImpl(
        this.getCardRepository(),
        this.getCardApiService(),
        this.getImageStorageService(),
      );
    }
    return this.cardService;
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
