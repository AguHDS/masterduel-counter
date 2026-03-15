export interface Archetype {
  id: number;
  name: string;
  registered: boolean;
  instance_count?: number;
}

export interface SearchResponse {
  data: {
    archetypes: Archetype[];
  };
  message?: string;
}

export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  imageUrlSmall: string;
  imageUrlCropped: string;
}
