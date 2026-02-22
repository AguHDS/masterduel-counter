import { useState, useCallback } from 'react';

export const useProfileEditor = (userId: string) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

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
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditMode(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleDeletePhoto = useCallback(async () => {
    setIsDeletingPhoto(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPreviewUrl(null);
      setSelectedFile(null);
    } finally {
      setIsDeletingPhoto(false);
    }
  }, []);

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
    isSaving,
    isDeletingPhoto,
    handleFileSelect,
    handleBioChange,
    handleSaveChanges,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  };
};
