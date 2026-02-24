import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';

export const useProfileEditor = (userId: string) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const updateBioMutation = useMutation({
    mutationFn: (bio: string) => profileApi.updateBio(userId, bio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => profileApi.deleteProfilePicture(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleBioChange = useCallback((value: string) => {
    setBioValue(value);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    try {
      // Save bio if changed
      if (bioValue.trim() !== '') {
        await updateBioMutation.mutateAsync(bioValue);
      }

      // Upload photo if selected
      if (selectedFile) {
        await uploadPhotoMutation.mutateAsync(selectedFile);
      }

      // Reset edit mode
      setIsEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [bioValue, selectedFile, updateBioMutation, uploadPhotoMutation]);

  const handleDeletePhoto = useCallback(async () => {
    try {
      await deletePhotoMutation.mutateAsync();
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }, [deletePhotoMutation]);

  const toggleEditMode = useCallback((currentBio: string) => {
    setIsEditMode(true);
    setBioValue(currentBio);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditMode(false);
    setBioValue('');
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  return {
    isEditMode,
    bioValue,
    selectedFile,
    previewUrl,
    isSaving: updateBioMutation.isPending || uploadPhotoMutation.isPending,
    isDeletingPhoto: deletePhotoMutation.isPending,
    handleFileSelect,
    handleBioChange,
    handleSaveChanges,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  };
};
