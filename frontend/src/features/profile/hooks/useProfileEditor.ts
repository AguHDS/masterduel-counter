import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";

export const useProfileEditor = (userId: string) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const updateBioMutation = useMutation({
    mutationFn: (bio: string) => profileApi.updateBio(userId, bio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setFileError(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error: { code: string; message: string }) => {
      if (error.code === "FILE_TOO_LARGE") {
        setFileError(error.message);
      } else {
        setFileError(error.message || "Failed to upload profile picture");
      }
      console.error("Error uploading profile picture:", error);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => profileApi.deleteProfilePicture(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const readFileAsDataUrl = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      }),
    [],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const maxSize = 3 * 1024 * 1024; // 3MB, if change, also change backend limit size validation
      if (file.size > maxSize) {
        setFileError(
          `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 3MB.`,
        );
        setSelectedFile(null);
        return;
      }

      setFileError(null);

      try {
        const dataUrl = await readFileAsDataUrl(file);
        setCropImageSrc(dataUrl);
        setIsCropperOpen(true);
      } catch (error) {
        console.error("Error reading selected file:", error);
        setFileError("Could not read the selected image.");
      }
    },
    [readFileAsDataUrl],
  );

  const handleCropConfirm = useCallback(
    async (croppedFile: File) => {
      try {
        const dataUrl = await readFileAsDataUrl(croppedFile);
        setPreviewUrl(dataUrl);
        setSelectedFile(croppedFile);
      } catch (error) {
        console.error("Error reading cropped file:", error);
        setFileError("Could not process the cropped image.");
        return;
      }

      setIsCropperOpen(false);
      setCropImageSrc(null);
    },
    [readFileAsDataUrl],
  );

  const handleCropCancel = useCallback(() => {
    setIsCropperOpen(false);
    setCropImageSrc(null);
  }, []);

  const handleBioChange = useCallback((value: string) => {
    setBioValue(value);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      // Always save bio (even if empty)
      await updateBioMutation.mutateAsync(bioValue);

      if (selectedFile) {
        await uploadPhotoMutation.mutateAsync(selectedFile);
      }

      // Reset edit mode
      setIsEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileError(null);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }, [bioValue, selectedFile, updateBioMutation, uploadPhotoMutation]);

  const handleDeletePhoto = useCallback(async () => {
    try {
      await deletePhotoMutation.mutateAsync();
      setPreviewUrl(null);
      setSelectedFile(null);
      setFileError(null);
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  }, [deletePhotoMutation]);

  const toggleEditMode = useCallback((currentBio: string) => {
    setIsEditMode(true);
    setBioValue(currentBio);
    setFileError(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditMode(false);
    setBioValue("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setIsCropperOpen(false);
    setCropImageSrc(null);
  }, []);

  return {
    isEditMode,
    bioValue,
    selectedFile,
    previewUrl,
    fileError,
    isCropperOpen,
    cropImageSrc,
    isSaving: updateBioMutation.isPending || uploadPhotoMutation.isPending,
    isDeletingPhoto: deletePhotoMutation.isPending,
    handleFileSelect,
    handleCropConfirm,
    handleCropCancel,
    handleBioChange,
    handleSaveChanges,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  };
};