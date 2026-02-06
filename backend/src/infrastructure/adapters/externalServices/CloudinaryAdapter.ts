import { ImageStorageService, UploadResult } from "@/domain/ports/externalServices/ImageStorageService";
import { cloudinary } from "@/services/cloudinary";
import streamifier from "streamifier";

export class CloudinaryAdapter implements ImageStorageService {
  private readonly baseFolder = "masterduel-counter";

  async uploadImageToCloudinary(buffer: Buffer, publicId: string, customFolder?: string): Promise<UploadResult> {
    const folder = customFolder || `${this.baseFolder}/cards`;
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Failed to upload image to Cloudinary: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed: No result returned"));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image from Cloudinary: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
