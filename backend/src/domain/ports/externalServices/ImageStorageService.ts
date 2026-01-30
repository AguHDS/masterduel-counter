export interface UploadResult {
  url: string;
  publicId: string;
}

export interface ImageStorageService {
  uploadImage(buffer: Buffer, publicId: string, customFolder?: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<void>;
}
