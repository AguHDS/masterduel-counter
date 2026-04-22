import { DatabasePort, createYugiohDatabase } from "@/database/database.js";
import { SqliteArchetypeRepository } from "@/infrastructure/repositories/SqliteArchetypeRepository.js";
import { SqliteUserRepository } from "@/infrastructure/repositories/SqliteUserRepository.js";
import { SqliteCardRepository } from "@/infrastructure/repositories/SqliteCardRepository.js";
import { SqliteArchetypeCardPairRepository } from "@/infrastructure/repositories/SqliteArchetypeCardPairRepository.js";
import { SqliteArchetypeGuideRepository } from "@/infrastructure/repositories/SqliteArchetypeGuideRepository.js";
import { SqliteProfileRepository } from "@/infrastructure/repositories/SqliteProfileRepository.js";
import { ArchetypeApplicationService } from "@/application/services/ArchetypeApplicationService.js";
import { GuideApplicationService } from "@/application/services/GuideApplicationService.js";
import { GuideInstanceServicePort } from "@/application/ports/GuideApplicationPort.js";
import { AuthApplicationService } from "@/application/services/AuthApplicationService.js";
import { CardApplicationService } from "@/application/services/CardApplicationService.js";
import { ProfileApplicationService } from "@/application/services/ProfileApplicationService.js";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository.js";
import { UserRepository } from "@/domain/ports/UserRepository.js";
import { CardRepository } from "@/domain/ports/CardRepository.js";
import { GuideCardPairRepository } from "@/domain/ports/GuideCardPairRepository.js";
import { GuideRepository } from "@/domain/ports/GuideRepository.js";
import { ProfileRepository } from "@/domain/ports/ProfileRepository.js";
import { AuthApplicationPort } from "@/application/ports/AuthApplicationPort.js";
import { CardApplicationPort } from "@/application/ports/CardApplicationPort.js";
import { ProfileApplicationPort } from "@/application/ports/ProfileApplicationPort.js";
import { CardApiService } from "@/domain/ports/externalServices/CardApiService.js";
import { CardDetailsApiService } from "@/domain/ports/externalServices/CardDetailsApiService.js";
import { ImageStorageService } from "@/domain/ports/externalServices/ImageStorageService.js";
import { YgoProDeckCardPreviewAdapter } from "@/infrastructure/adapters/externalServices/YgoProDeckCardPreviewAdapter.js";
import { YgoProDeckCardDetailsAdapter } from "@/infrastructure/adapters/externalServices/YgoProDeckCardDetailsAdapter.js";
import { CloudinaryAdapter } from "@/infrastructure/adapters/externalServices/CloudinaryAdapter.js";
import { GetCardDetailsApplicationService } from "@/application/services/GetCardDetailsApplicationService.js";
import { getCardDetailsApplicationPort } from "@/application/ports/GetCardDetailsApplicationPort.js";
import { PrismaClient } from "@prisma/client";
import { PrismaRecommendedDeckRepository } from "@/infrastructure/repositories/PrismaRecommendedDeckRepository.js";
import { RecommendedDeckRepository } from "@/domain/ports/RecommendedDeckRepository.js";
import { RecommendedDeckApplicationService } from "@/application/services/RecommendedDeckApplicationService.js";
import { RecommendedDeckApplicationPort } from "@/application/ports/RecommendedDeckApplicationPort.js";
import { AdminApplicationService } from "@/application/services/AdminApplicationService.js";
import { AdminApplicationPort } from "@/application/ports/AdminApplicationPort.js";
import { AdminRepository } from "@/domain/ports/AdminRepository.js";
import { SqliteAdminRepository } from "@/infrastructure/repositories/SqliteAdminRepository.js";
import { ReportApplicationPort } from "@/application/ports/ReportApplicationPort.js";
import { ReportApplicationService } from "@/application/services/ReportApplicationService.js";
import { ReportRepository } from "@/domain/ports/ReportRepository.js";
import { SqliteReportRepository } from "@/infrastructure/repositories/SqliteReportRepository.js";
import { CommentRepository } from "@/domain/ports/CommentRepository.js";
import { CommentApplicationPort } from "@/application/ports/CommentApplicationPort.js";
import { SqliteCommentRepository } from "@/infrastructure/repositories/SqliteCommentRepository.js";
import { CommentApplicationService } from "@/application/services/CommentApplicationService.js";
import { NotificationRepository } from "@/domain/ports/NotificationRepository.js";
import { NotificationApplicationPort } from "@/application/ports/NotificationApplicationPort.js";
import { SqliteNotificationRepository } from "@/infrastructure/repositories/SqliteNotificationRepository.js";
import { NotificationApplicationService } from "@/application/services/NotificationApplicationService.js";
import { CustomDeckRepository } from "@/domain/ports/CustomDeckRepository.js";
import { CustomDeckApplicationPort } from "@/application/ports/CustomDeckApplicationPort.js";
import { PrismaCustomDeckRepository } from "@/infrastructure/repositories/PrismaCustomDeckRepository.js";
import { CustomDeckApplicationService } from "@/application/services/CustomDeckApplicationService.js";
import { InitialHandRepository } from "@/domain/ports/InitialHandRepository.js";
import { InitialHandApplicationPort } from "@/application/ports/InitialHandApplicationPort.js";
import { SqliteInitialHandRepository } from "@/infrastructure/repositories/SqliteInitialHandRepository.js";
import { InitialHandApplicationService } from "@/application/services/InitialHandApplicationService.js";
import { ComboStepRepository } from "@/domain/ports/ComboStepRepository.js";
import { ComboStepApplicationPort } from "@/application/ports/ComboStepApplicationPort.js";
import { SqliteComboStepRepository } from "@/infrastructure/repositories/SqliteComboStepRepository.js";
import { ComboStepApplicationService } from "@/application/services/ComboStepApplicationService.js";
import { RankingRepository } from "@/domain/ports/RankingRepository.js";
import { RankingApplicationPort } from "@/application/ports/RankingApplicationPort.js";
import { SqliteRankingRepository } from "@/infrastructure/repositories/SqliteRankingRepository.js";
import { RankingApplicationService } from "@/application/services/RankingApplicationService.js";
import { GuideRequestRepository } from "@/domain/ports/GuideRequestRepository.js";
import { GuideRequestApplicationPort } from "@/application/ports/GuideRequestApplicationPort.js";
import { SqliteGuideRequestRepository } from "@/infrastructure/repositories/SqliteGuideRequestRepository.js";
import { GuideRequestApplicationService } from "@/application/services/GuideRequestApplicationService.js";

export class Dependencies {
  private database: DatabasePort;
  private prisma: PrismaClient;
  private archetypeRepository: ArchetypeRepository | null = null;
  private userRepository: UserRepository | null = null;
  private cardRepository: CardRepository | null = null;
  private cardPairRepository: GuideCardPairRepository | null = null;
  private instanceRepository: GuideRepository | null = null;
  private profileRepository: ProfileRepository | null = null;
  private recommendedDeckRepository: RecommendedDeckRepository | null = null;
  private archetypeService: ArchetypeApplicationService | null = null;
  private instanceService: GuideInstanceServicePort | null = null;
  private authService: AuthApplicationPort | null = null;
  private cardService: CardApplicationPort | null = null;
  private profileService: ProfileApplicationPort | null = null;
  private recommendedDeckService: RecommendedDeckApplicationPort | null = null;
  private cardApiService: CardApiService | null = null;
  private cardDetailsApiService: CardDetailsApiService | null = null;
  private getCardDetailsService: getCardDetailsApplicationPort | null = null;
  private imageStorageService: ImageStorageService | null = null;
  private adminService: AdminApplicationPort | null = null;
  private adminRepository: AdminRepository | null = null;
  private reportService: ReportApplicationPort | null = null;
  private reportRepository: ReportRepository | null = null;
  private commentRepository: CommentRepository | null = null;
  private commentService: CommentApplicationPort | null = null;
  private notificationRepository: NotificationRepository | null = null;
  private notificationService: NotificationApplicationPort | null = null;
  private customDeckRepository: CustomDeckRepository | null = null;
  private customDeckService: CustomDeckApplicationPort | null = null;
  private initialHandRepository: InitialHandRepository | null = null;
  private initialHandService: InitialHandApplicationPort | null = null;
  private comboStepRepository: ComboStepRepository | null = null;
  private comboStepService: ComboStepApplicationPort | null = null;
  private rankingRepository: RankingRepository | null = null;
  private rankingService: RankingApplicationPort | null = null;
  private guideRequestRepository: GuideRequestRepository | null = null;
  private guideRequestService: GuideRequestApplicationPort | null = null;

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

  getAdminRepository(): AdminRepository {
    if (!this.adminRepository) {
      this.adminRepository = new SqliteAdminRepository(this.prisma);
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

  getCardPairRepository(): GuideCardPairRepository {
    if (!this.cardPairRepository) {
      this.cardPairRepository = new SqliteArchetypeCardPairRepository(
        this.database.getConnection(),
      );
    }
    return this.cardPairRepository;
  }

  getInstanceRepository(): GuideRepository {
    if (!this.instanceRepository) {
      this.instanceRepository = new SqliteArchetypeGuideRepository(
        this.database.getConnection(),
        this.prisma,
      );
    }
    return this.instanceRepository;
  }

  getProfileRepository(): ProfileRepository {
    if (!this.profileRepository) {
      this.profileRepository = new SqliteProfileRepository(this.prisma);
    }
    return this.profileRepository;
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

  getGetCardDetailsService(): getCardDetailsApplicationPort {
    if (!this.getCardDetailsService) {
      this.getCardDetailsService = new GetCardDetailsApplicationService(
        this.getCardDetailsApiService(),
      );
    }
    return this.getCardDetailsService;
  }

  getArchetypeService(): ArchetypeApplicationService {
    if (!this.archetypeService) {
      this.archetypeService = new ArchetypeApplicationService(
        this.getArchetypeRepository(),
      );
    }
    return this.archetypeService;
  }

  getInstanceService(): GuideInstanceServicePort {
    if (!this.instanceService) {
      this.instanceService = new GuideApplicationService(
        this.getInstanceRepository(),
        this.getCardPairRepository(),
        this.getArchetypeRepository(),
        this.getNotificationService(),
        this.getUserRepository(),
        this.getInitialHandRepository(),
        this.getComboStepRepository(),
      );
    }
    return this.instanceService;
  }

  getAuthService(): AuthApplicationPort {
    if (!this.authService) {
      this.authService = new AuthApplicationService(this.getUserRepository());
    }
    return this.authService;
  }

  getCardService(): CardApplicationPort {
    if (!this.cardService) {
      this.cardService = new CardApplicationService(
        this.getCardRepository(),
        this.getCardApiService(),
      );
    }
    return this.cardService;
  }

  getProfileService(): ProfileApplicationPort {
    if (!this.profileService) {
      this.profileService = new ProfileApplicationService(
        this.getProfileRepository(),
        this.getImageStorageService(),
        this.getInstanceRepository(),
        this.getUserRepository(),
        this.getRankingRepository(),
      );
    }
    return this.profileService;
  }

  getRecommendedDeckRepository(): RecommendedDeckRepository {
    if (!this.recommendedDeckRepository) {
      this.recommendedDeckRepository = new PrismaRecommendedDeckRepository(
        this.prisma,
      );
    }
    return this.recommendedDeckRepository;
  }

  getRecommendedDeckService(): RecommendedDeckApplicationPort {
    if (!this.recommendedDeckService) {
      this.recommendedDeckService = new RecommendedDeckApplicationService(
        this.getRecommendedDeckRepository(),
        this.getCardRepository(),
      );
    }
    return this.recommendedDeckService;
  }

  getAdminService(): AdminApplicationPort {
    if (!this.adminService) {
      this.adminService = new AdminApplicationService(this.getAdminRepository());
    }
    return this.adminService;
  }

  getReportRepository(): ReportRepository {
    if (!this.reportRepository) {
      this.reportRepository = new SqliteReportRepository(this.prisma);
    }
    return this.reportRepository;
  }

  getReportService(): ReportApplicationPort {
    if (!this.reportService) {
      this.reportService = new ReportApplicationService(
        this.getReportRepository(),
        this.getUserRepository(),
        this.getProfileRepository(),
        this.getInstanceRepository(),
      );
    }
    return this.reportService;
  }

  getCommentRepository(): CommentRepository {
    if (!this.commentRepository) {
      this.commentRepository = new SqliteCommentRepository(this.prisma);
    }
    return this.commentRepository;
  }

  getCommentService(): CommentApplicationPort {
    if (!this.commentService) {
      this.commentService = new CommentApplicationService(
        this.getCommentRepository(),
        this.getNotificationService(),
        this.getInstanceRepository(),
      );
    }
    return this.commentService;
  }

  getNotificationRepository(): NotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new SqliteNotificationRepository(
        this.database.getConnection(),
        this.prisma,
      );
    }
    return this.notificationRepository;
  }

  getNotificationService(): NotificationApplicationPort {
    if (!this.notificationService) {
      this.notificationService = new NotificationApplicationService(
        this.getNotificationRepository(),
      );
    }
    return this.notificationService;
  }

  getCustomDeckRepository(): CustomDeckRepository {
    if (!this.customDeckRepository) {
      this.customDeckRepository = new PrismaCustomDeckRepository(this.prisma);
    }
    return this.customDeckRepository;
  }

  getCustomDeckService(): CustomDeckApplicationPort {
    if (!this.customDeckService) {
      this.customDeckService = new CustomDeckApplicationService(
        this.getCustomDeckRepository(),
        this.getCardRepository(),
      );
    }
    return this.customDeckService;
  }

  getInitialHandRepository(): InitialHandRepository {
    if (!this.initialHandRepository) {
      this.initialHandRepository = new SqliteInitialHandRepository(
        this.database.getConnection(),
      );
    }
    return this.initialHandRepository;
  }

  getInitialHandService(): InitialHandApplicationPort {
    if (!this.initialHandService) {
      this.initialHandService = new InitialHandApplicationService(
        this.getInitialHandRepository(),
      );
    }
    return this.initialHandService;
  }

  getComboStepRepository(): ComboStepRepository {
    if (!this.comboStepRepository) {
      this.comboStepRepository = new SqliteComboStepRepository(
        this.database.getConnection(),
      );
    }
    return this.comboStepRepository;
  }

  getComboStepService(): ComboStepApplicationPort {
    if (!this.comboStepService) {
      this.comboStepService = new ComboStepApplicationService(
        this.getComboStepRepository(),
      );
    }
    return this.comboStepService;
  }

  getDatabase(): DatabasePort {
    return this.database;
  }

  getRankingRepository(): RankingRepository {
    if (!this.rankingRepository) {
      this.rankingRepository = new SqliteRankingRepository(this.prisma);
    }
    return this.rankingRepository;
  }

  getRankingService(): RankingApplicationPort {
    if (!this.rankingService) {
      this.rankingService = new RankingApplicationService(
        this.getRankingRepository(),
      );
    }
    return this.rankingService;
  }

  getGuideRequestRepository(): GuideRequestRepository {
    if (!this.guideRequestRepository) {
      this.guideRequestRepository = new SqliteGuideRequestRepository(this.prisma);
    }
    return this.guideRequestRepository;
  }

  getGuideRequestService(): GuideRequestApplicationPort {
    if (!this.guideRequestService) {
      this.guideRequestService = new GuideRequestApplicationService(
        this.getGuideRequestRepository(),
      );
    }
    return this.guideRequestService;
  }

  getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  close(): void {
    this.database.close();
    this.prisma.$disconnect();
  }
}

// Singleton instance
let dependenciesInstance: Dependencies | null = null;

/** Main dependencies instance */
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
  getAdminService: getDependencies().getAdminService(),
};