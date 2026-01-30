export interface RawCardData {
  id: number;
  name: string;
  card_images: Array<{
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}

export interface CardApiService {
  searchByName(name: string): Promise<RawCardData[]>;
  findById(id: number): Promise<RawCardData | null>;
  downloadImage(url: string): Promise<Buffer>;
}
