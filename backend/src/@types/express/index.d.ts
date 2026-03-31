import "express";
import type {
  UserSession,
  UserAndPassword,
  BaseUserData,
  UserId,
  UserSearchResult,
} from "@/shared/dtos/userDto";

declare module "express" {
  interface Request {
    // Existing properties
    requesterData?: {
      id: string;
      role: string;
    };
    userId?: UserId;
    userAndPassword?: UserAndPassword;
    userSession?: UserSession;
    refreshTokenId?: string;
    baseUserData?: BaseUserData;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    userToDelete?: UserSearchResult;

    // Recommended Deck properties
    validatedInstanceId?: number;
    validatedDeckData?: {
      instanceId: number;
      userId: UserId;
      title?: string;
      mainDeckCards: number[];
      extraDeckCards: number[];
      sideDeckCards: number[];
    };
    validatedDeleteData?: {
      instanceId: number;
      userId: UserId;
    };

    // Guides properties
    validatedDeleteGuideData?: {
      instanceId: number;
      userId: UserId;
    };

    validatedCommentData?: {
      commentId: number;
      content?: string;
    };

    // Custom Deck properties
    validatedCustomDeckData?: {
      userId: string;
      userRole: string;
      title: string;
      mainDeckCards: number[];
      extraDeckCards: number[];
      sideDeckCards: number[];
      isPublic: boolean;
      headerCardId?: number;
    };

    validatedCustomDeckUpdateData?: {
      deckId: number;
      userId: string;
      title?: string;
      mainDeckCards?: number[];
      extraDeckCards?: number[];
      sideDeckCards?: number[];
      isPublic?: boolean;
      headerCardId?: number;
    };

    validatedCustomDeckReorderData?: {
      userId: string;
      deckOrders: { deckId: number; displayOrder: number }[];
    };
  }
}
