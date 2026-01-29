import { DatabasePort, createYugiohDatabase } from "@/database/database";
import { SqliteArchetypeRepository } from "@/infrastructure/repositories/SqliteArchetypeRepository";
import { SqliteUserRepository } from "@/infrastructure/repositories/SqliteUserRepository";
import { SqliteCardRepository } from "@/infrastructure/repositories/SqliteCardRepository";
import { SqliteArchetypeCardPairRepository } from "@/infrastructure/repositories/SqliteArchetypeCardPairRepository";
import { SqliteArchetypeInstanceRepository } from "@/infrastructure/repositories/SqliteArchetypeInstanceRepository";
import { ArchetypeService } from "@/application/services/ArchetypeService";
import { ArchetypeInstanceService } from "@/application/services/ArchetypeInstanceService";
import { AuthServiceImpl } from "@/application/services/AuthService";
import { CardServiceImpl } from "@/application/services/CardService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { UserRepository } from "@/domain/ports/UserRepository";
import { CardRepository } from "@/domain/ports/CardRepository";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import { ArchetypeInstanceRepository } from "@/domain/ports/ArchetypeInstanceRepository";
import { AuthService } from "@/application/ports/AuthService";
import { CardService } from "@/application/ports/CardService";
import { ArchetypeInstanceServicePort } from "@/application/ports/ArchetypeInstanceService";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService";
import { CardDetailsApiService } from "@/domain/ports/externalServices/CardDetailsApiService";
import { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService";
import { YgoProDeckCardPreviewAdapter } from "@/infrastructure/adapters/externalServices/YgoProDeckCardPreviewAdapter";
import { YgoProDeckCardDetailsAdapter } from "@/infrastructure/adapters/externalServices/YgoProDeckCardDetailsAdapter";
import { CloudinaryAdapter } from "@/infrastructure/adapters/externalServices/CloudinaryAdapter";
import { GetCardDetailsService } from "@/application/services/GetCardDetailsService";
import { GetCardDetailsPort } from "@/application/ports/GetCardDetailsPort";
import { PrismaClient } from "@prisma/client";

export class Dependencies {
  private database: DatabasePort;
  private prisma: PrismaClient;
  private archetypeRepository: ArchetypeRepository | null = null;
  private userRepository: UserRepository | null = null;
  private cardRepository: CardRepository | null = null;
  private cardPairRepository: ArchetypeCardPairRepository | null = null;
  private instanceRepository: ArchetypeInstanceRepository | null = null;
  private archetypeService: ArchetypeService | null = null;
  private instanceService: ArchetypeInstanceServicePort | null = null;
  private authService: AuthService | null = null;
  private cardService: CardService | null = null;
  private cardApiService: CardApiService | null = null;
  private cardDetailsApiService: CardDetailsApiService | null = null;
  private getCardDetailsService: GetCardDetailsPort | null = null;
  private imageStorageService: ImageStorageService | null = null;

  constructor() {
    this.database = createYugiohDatabase();
    this.prisma = new PrismaClient();
  }

  getArchetypeRepository(): ArchetypeRepository {
    if (!this.archetypeRepository) {
      this.archetypeRepository = new SqliteArchetypeRepository(
        this.database.getConnection(),
      );
    }
    return this.archetypeRepository;
  }

  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new SqliteUserRepository(this.prisma);
    }
    return this.userRepository;
  }

  // Backward compatibility - alias for getUserRepository
  getAdminRepository(): UserRepository {
    return this.getUserRepository();
  }

  getCardRepository(): CardRepository {
    if (!this.cardRepository) {
      this.cardRepository = new SqliteCardRepository(
        this.database.getConnection(),
      );
    }
    return this.cardRepository;
  }

  getCardPairRepository(): ArchetypeCardPairRepository {
    if (!this.cardPairRepository) {
      this.cardPairRepository = new SqliteArchetypeCardPairRepository(
        this.database.getConnection(),
      );
    }
    return this.cardPairRepository;
  }

  getInstanceRepository(): ArchetypeInstanceRepository {
    if (!this.instanceRepository) {
      this.instanceRepository = new SqliteArchetypeInstanceRepository(
        this.database.getConnection(),
      );
    }
    return this.instanceRepository;
  }

  getCardApiService(): CardApiService {
    if (!this.cardApiService) {
      this.cardApiService = new YgoProDeckCardPreviewAdapter();
    }
    return this.cardApiService;
  }

  getImageStorageService(): ImageStorageService {
    if (!this.imageStorageService) {
      this.imageStorageService = new CloudinaryAdapter();
    }
    return this.imageStorageService;
  }

  getCardDetailsApiService(): CardDetailsApiService {
    if (!this.cardDetailsApiService) {
      this.cardDetailsApiService = new YgoProDeckCardDetailsAdapter();
    }
    return this.cardDetailsApiService;
  }

  getGetCardDetailsService(): GetCardDetailsPort {
    if (!this.getCardDetailsService) {
      this.getCardDetailsService = new GetCardDetailsService(
        this.getCardDetailsApiService()
      );
    }
    return this.getCardDetailsService;
  }

  getArchetypeService(): ArchetypeService {
    if (!this.archetypeService) {
      this.archetypeService = new ArchetypeService(
        this.getArchetypeRepository(),
        this.getCardPairRepository(),
        this.getCardService(),
      );
    }
    return this.archetypeService;
  }

  getInstanceService(): ArchetypeInstanceServicePort {
    if (!this.instanceService) {
      this.instanceService = new ArchetypeInstanceService(
        this.getInstanceRepository(),
      );
    }
    return this.instanceService;
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

export const compositionRoot = {
  getCardDetailsService: getDependencies().getGetCardDetailsService(),
};
