export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  cloudinaryPublicIdCropped: string;
  isTemporary: boolean;
  createdAt: string;
}

export interface CardSearchResult {
  id: number;
  name: string;
  imageUrlExternal?: string;
  imageUrlSmallExternal?: string;
}

export interface CardPreviewDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}

export interface CardCreateDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  cloudinaryPublicIdCropped: string;
  isTemporary: boolean;
}
