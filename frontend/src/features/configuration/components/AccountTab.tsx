import type { ConfigurationTab } from "../types";

interface AccountTabProps {
  activeTab: ConfigurationTab;
}

export const AccountTab = ({ activeTab }: AccountTabProps) => {
  if (activeTab !== "account") return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Account Settings
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Manage your account settings and preferences.
        </p>
      </div>
    </div>
  );
};
