import type { ConfigurationTab } from "../types";
import { ChangePasswordForm } from "./ChangePasswordForm";

interface AccountTabProps {
  activeTab: ConfigurationTab;
}

export const AccountTab = ({ activeTab }: AccountTabProps) => {
  if (activeTab !== "account") return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Change Password
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Update your password to keep your account secure.
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
};
