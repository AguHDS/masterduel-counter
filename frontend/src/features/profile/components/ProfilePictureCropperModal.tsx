import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, X, ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "../utils/cropImage";

interface ProfilePictureCropperModalProps {
  open: boolean;
  imageSrc: string | null;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

/** Component for cropping the profile picture when editing */
export const ProfilePictureCropperModal = ({
  open,
  imageSrc,
  onConfirm,
  onCancel,
}: ProfilePictureCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels);
      onConfirm(file);
    } catch (error) {
      console.error("Error cropping profile picture:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, onConfirm]);

  const handleCancel = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsProcessing(false);
    onCancel();
  }, [onCancel]);

  if (!open || !imageSrc) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[500]" />
      <div
        className="fixed inset-0 z-[501] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Crop profile picture"
      >
        <div className="w-full max-w-lg overflow-hidden rounded-lg border-2 border-yellow-600/40 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-600/30">
            <div className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-yellow-400" />
              <h3 className="text-yellow-400 font-bold text-sm tracking-wide">
                Crop Photo
              </h3>
            </div>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close cropper"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="px-5 py-2 text-xs text-gray-400">
            Drag to move the selection and use the slider to zoom. The square is
            the area that will be shown.
          </p>

          <div className="relative h-80 w-full bg-slate-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t border-yellow-600/30">
            <ZoomIn className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 px-5 pb-5">
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white rounded border border-gray-700 hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-yellow-500 hover:bg-yellow-400 rounded transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};