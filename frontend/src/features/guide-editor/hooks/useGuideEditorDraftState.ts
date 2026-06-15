import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface UseGuideEditorDraftStateParams {
  isEditMode: boolean;
  isOwner: boolean;
  snapshot: string;
}

/**
 * Manages draft state, dirty tracking, and navigation guards for guide editing
 * Prevents accidental navigation away from unsaved changes
 */
export const useGuideEditorDraftState = ({
  isEditMode,
  isOwner,
  snapshot,
}: UseGuideEditorDraftStateParams) => {
  const allowNavigationRef = useRef(false);
  const editStartSnapshotRef = useRef<string | null>(null);
  const [hasDirtyEdits, setHasDirtyEdits] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (!isEditMode || !isOwner || !hasDirtyEdits || allowNavigationRef.current) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const destination = new URL(anchor.href, window.location.origin);
      if (destination.origin !== window.location.origin) {
        return;
      }

      const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;
      const currentPath = `${location.pathname}${location.search}${location.hash}`;
      if (nextPath === currentPath) {
        return;
      }

      event.preventDefault();

      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?",
      );

      if (!confirmed) {
        return;
      }

      allowNavigationRef.current = true;
      navigate(nextPath);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [
    hasDirtyEdits,
    isEditMode,
    isOwner,
    location.hash,
    location.pathname,
    location.search,
    navigate,
  ]);

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

  const markClean = useCallback(() => {
    editStartSnapshotRef.current = snapshot;
    setHasDirtyEdits(false);
  }, [snapshot]);

  return {
    hasDirtyEdits,
    allowNavigation,
    blockNavigation,
    confirmDiscardIfDirty,
    markClean,
  };
};
