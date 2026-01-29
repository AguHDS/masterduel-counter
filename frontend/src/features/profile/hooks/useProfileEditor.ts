import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";

export const useProfileEditor = (userId: string) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateBioMutation = useMutation({
    mutationFn: (bio: string) => profileApi.updateBio(userId, bio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setIsEditMode(false);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setSelectedFile(null);
      setPreviewUrl(null);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => profileApi.deleteProfilePicture(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file size (3MB max)
    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleBioChange = (value: string) => {
    if (value.length <= 1000) {
      setBioValue(value);
    }
  };

  const handleSaveBio = () => {
    updateBioMutation.mutate(bioValue);
  };

  const handleSaveChanges = async () => {
    try {
      // Upload photo first if there's a new file
      if (selectedFile) {
        await uploadPhotoMutation.mutateAsync(selectedFile);
      }
      
      // Then update bio
      await updateBioMutation.mutateAsync(bioValue);
      
      setIsEditMode(false);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleUploadPhoto = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    }
  };

  const handleDeletePhoto = () => {
    if (window.confirm("Are you sure you want to delete your profile picture?")) {
      deletePhotoMutation.mutate();
    }
  };

  const toggleEditMode = (currentBio: string) => {
    if (!isEditMode) {
      setBioValue(currentBio || "");
    }
    setIsEditMode(!isEditMode);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setBioValue("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return {
    isEditMode,
    bioValue,
    selectedFile,
    previewUrl,
    isUpdatingBio: updateBioMutation.isPending,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    isDeletingPhoto: deletePhotoMutation.isPending,
    isSaving: updateBioMutation.isPending || uploadPhotoMutation.isPending,
    handleFileSelect,
    handleBioChange,
    handleSaveBio,
    handleSaveChanges,
    handleUploadPhoto,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  };
};
