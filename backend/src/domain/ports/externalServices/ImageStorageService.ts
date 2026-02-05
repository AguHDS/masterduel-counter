export interface UploadResult {
  url: string;
  publicId: string;
}

export interface ImageStorageService {
  /** Upload image to Cloudinary and return its URL and public ID */
  uploadImageToCloudinary(buffer: Buffer, publicId: string, customFolder?: string): Promise<UploadResult>;
  /** Delete image from Cloudinary by its public ID */
  deleteImageFromCloudinary(publicId: string): Promise<void>;
}
