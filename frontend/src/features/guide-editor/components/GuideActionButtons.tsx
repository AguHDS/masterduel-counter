import {
  CreditCard as Edit3,
  Trash2,
  Save,
  X,
  Flag,
  FileText,
} from "lucide-react";

interface GuideActionButtonsProps {
  isEditMode: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isDraft: boolean;
  isCreatingNew: boolean;
  isAuthenticated: boolean;
  draftInstanceId: number | undefined;
  isArchetypeRegistered: boolean;
  saving: boolean;
  savingDraft: boolean;
  draftMessage: string | null;
  draftError: string | null;
  validationError: string | null;
  onSave: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onDeleteDraft: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onRegister: () => void;
}

/** Renders guide actions (edit, save, draft, delete, report, and registration controls) based on user state and permissions */
export const GuideActionButtons = ({
  isEditMode,
  isOwner,
  isAdmin,
  isDraft,
  isCreatingNew,
  isAuthenticated,
  draftInstanceId,
  isArchetypeRegistered,
  saving,
  savingDraft,
  draftMessage,
  draftError,
  validationError,
  onSave,
  onCancel,
  onSaveDraft,
  onDeleteDraft,
  onEdit,
  onDelete,
  onReport,
  onRegister,
}: GuideActionButtonsProps) => {
  return (
    <>
      {isEditMode && isOwner && !(isAdmin && isDraft) && (
        <div className="flex flex-col items-center gap-4 relative top-10">
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {isCreatingNew && (
              <button
                onClick={onSaveDraft}
                disabled={savingDraft || saving}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/60 backdrop-blur-sm hover:bg-slate-700/90 active:bg-slate-700/30 text-slate-200 rounded-lg transition-colors shadow-md text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {savingDraft
                    ? "Saving draft..."
                    : draftInstanceId
                      ? "Update Draft"
                      : "Draft"}
                </span>
              </button>
            )}
            {isCreatingNew && draftInstanceId && (
              <button
                onClick={onDeleteDraft}
                disabled={savingDraft || saving}
                className="flex items-center space-x-2 px-4 py-2 bg-red-900/40 backdrop-blur-sm hover:bg-red-900/70 active:bg-red-900/20 text-red-300 rounded-lg transition-colors shadow-md text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Draft</span>
              </button>
            )}
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? "Saving..."
                  : isCreatingNew
                    ? "Publish"
                    : "Save Changes"}
              </span>
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md text-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
          {draftMessage && (
            <p className="text-slate-300 text-sm text-center max-w-md bg-slate-800/60 px-4 py-2 rounded-lg">
              {draftMessage}
            </p>
          )}
          {draftError && (
            <p className="text-red-400 text-sm text-center max-w-md">
              {draftError}
            </p>
          )}
          {validationError && (
            <p className="text-red-400 text-sm text-center max-w-md">
              {validationError}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center space-x-4 relative top-3">
        {isAuthenticated &&
          isArchetypeRegistered &&
          !isEditMode &&
          !isCreatingNew &&
          isOwner && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 max-[500px]:px-3 max-[500px]:py-1.5 max-[500px]:text-sm max-[500px]:space-x-1 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Guide</span>
            </button>
          )}

        {isAuthenticated &&
          isArchetypeRegistered &&
          !isEditMode &&
          !isCreatingNew &&
          (isOwner || (isAdmin && !isDraft)) && (
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-4 py-2 max-[500px]:px-3 max-[500px]:py-1.5 max-[500px]:text-sm max-[500px]:space-x-1 bg-blue-950/60 backdrop-blur-sm hover:bg-blue-950/90 active:bg-blue-950/10 text-white rounded-lg transition-colors shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete guide</span>
            </button>
          )}

        {isAuthenticated &&
          isArchetypeRegistered &&
          !isEditMode &&
          !isCreatingNew &&
          !isOwner &&
          !isAdmin && (
            <button onClick={onReport} className="hover:text-red-800/80 text-white">
              <Flag className="w-5 h-5" />
            </button>
          )}

        {isAuthenticated &&
          !draftInstanceId &&
          !isArchetypeRegistered &&
          !isEditMode && (
            <button
              onClick={onRegister}
              className="flex items-center space-x-2 px-4 py-2 max-[500px]:px-3 max-[500px]:py-1.5 max-[500px]:text-sm max-[500px]:space-x-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Register Archetype</span>
            </button>
          )}
      </div>
    </>
  );
};
