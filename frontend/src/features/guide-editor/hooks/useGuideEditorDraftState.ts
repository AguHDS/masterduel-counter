import { useCallback, useEffect, useRef, useState } from "react";

interface UseGuideEditorDraftStateParams {
  isEditMode: boolean;
  isOwner: boolean;
  snapshot: string;
}

export const useGuideEditorDraftState = ({
  isEditMode,
  isOwner,
  snapshot,
}: UseGuideEditorDraftStateParams) => {
  // Manage draft status, dirty-checking and editing navigation guards
  const allowNavigationRef = useRef(false);
  const editStartSnapshotRef = useRef<string | null>(null);
  const [hasDirtyEdits, setHasDirtyEdits] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      editStartSnapshotRef.current = null;
      setHasDirtyEdits(false);
      return;
    }

    if (isOwner && !editStartSnapshotRef.current) {
      editStartSnapshotRef.current = snapshot;
      setHasDirtyEdits(false);
      return;
    }

    if (!editStartSnapshotRef.current) {
      setHasDirtyEdits(false);
      return;
    }

    setHasDirtyEdits(snapshot !== editStartSnapshotRef.current);
  }, [snapshot, isEditMode, isOwner]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigationRef.current || !hasDirtyEdits) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditMode, hasDirtyEdits]);

  const allowNavigation = useCallback(() => {
    // Enable intentional navigation to avoid blocking on save/delete
    allowNavigationRef.current = true;
  }, []);

  const blockNavigation = useCallback(() => {
    // Re-enable blocking when a protected navigation fails
    allowNavigationRef.current = false;
  }, []);

  const confirmDiscardIfDirty = useCallback(
    (message: string) => {
      // Ask for confirmation only when there are unsaved changes
      if (!hasDirtyEdits) {
        return true;
      }

      return window.confirm(message);
    },
    [hasDirtyEdits],
  );

  return {
    hasDirtyEdits,
    allowNavigation,
    blockNavigation,
    confirmDiscardIfDirty,
  };
};