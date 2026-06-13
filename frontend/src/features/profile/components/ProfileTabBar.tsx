import { Flag, Edit } from "lucide-react";
import { UserSearchDropdown } from "./UserSearchDropdown";
import type { TabType } from "../types/profileTypes";

interface TabConfig {
  id: TabType;
  label: string;
}

interface ProfileTabBarProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
  isOwner: boolean;
  hasSession: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  isSavingFavorites: boolean;
  fileError: string | null;
  onEditClick: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReportClick: () => void;
}

/** Tab navigation in user profile */
export const ProfileTabBar = ({
  tabs,
  activeTab,
  onTabChange,
  isOwner,
  hasSession,
  isEditMode,
  isSaving,
  isSavingFavorites,
  fileError,
  onEditClick,
  onSave,
  onCancel,
  onReportClick,
}: ProfileTabBarProps) => {
  return (
    <div className="relative z-10 border-b border-yellow-600/30 bg-slate-900/40 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:gap-3 p-3 min-[1553px]:flex-row min-[1553px]:items-center min-[1553px]:gap-4 overflow-visible">
        <div className="grid grid-cols-2 gap-1.5 min-[1553px]:flex min-[1553px]:flex-nowrap min-[1553px]:gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-bold transition-all relative overflow-hidden rounded border whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-yellow-400 border-yellow-500/60 bg-yellow-600/10"
                  : "text-gray-300 hover:text-yellow-300 border-yellow-600/30 hover:border-yellow-500/40 hover:bg-yellow-600/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Edit Profile / Report Buttons + Search */}
        <div className="flex gap-2 items-center flex-wrap min-[1553px]:ml-auto justify-end">
          <UserSearchDropdown />
          <div className="flex gap-2 items-center">
            {!isOwner && hasSession && (
              <button
                onClick={onReportClick}
                className="hover:text-red-700/80 text-white transition-colors p-2"
              >
                <Flag className="w-5 h-5" />
              </button>
            )}
            {isOwner && (
              <div className="flex gap-2 flex-shrink-0">
                {!isEditMode ? (
                  <button
                    onClick={onEditClick}
                    className="flex items-center gap-2 py-2 px-4 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded transition-colors border border-yellow-500 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onSave}
                      disabled={
                        isSaving ||
                        isSavingFavorites ||
                        !!fileError
                      }
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-sm"
                    >
                      {isSaving || isSavingFavorites
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      onClick={onCancel}
                      disabled={isSaving || isSavingFavorites}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
