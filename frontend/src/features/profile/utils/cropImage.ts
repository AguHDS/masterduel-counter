import type { Area } from "react-easy-crop";

/**
 * Generates a square JPEG File from the selected crop area of an image.
 * Used to bake the crop into the image before uploading it (Option 1: crop on the client).
 * Draws the requested crop area directly onto a canvas sized to the crop, then
 * exports it as a JPEG File. This avoids the getImageData/putImageData "safe area"
 * technique, which can produce a black image on some browsers.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(
          new File([blob], "profile-picture.jpg", {
            type: "image/jpeg",
          }),
        );
      },
      "image/jpeg",
      0.9,
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}