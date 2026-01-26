export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  isTemporary: boolean;
  createdAt: string;
}

export interface CardSearchResult {
  id: number;
  name: string;
}

export interface CardPreviewDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
}

export interface CardCreateDTO {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  cloudinaryPublicId: string;
  cloudinaryPublicIdSmall: string;
  isTemporary: boolean;
}
