import { Users, AlertCircle, BarChart, Newspaper, Swords, Library } from "lucide-react";
import type { AdminTab } from "../types/adminPanelTypes";

interface TabNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  const tabs = [
    { id: "accounts" as AdminTab, label: "Manage Accounts", icon: Users },
    { id: "reports" as AdminTab, label: "Reports", icon: AlertCircle },
    { id: "tracking" as AdminTab, label: "Tracking", icon: BarChart },
    { id: "latest-updates" as AdminTab, label: "Latest Updates", icon: Newspaper },
    { id: "tier-list" as AdminTab, label: "Tier List", icon: Swords },
    { id: "archetypes" as AdminTab, label: "Archetypes", icon: Library },
  ];

  return (
    <div className="flex gap-2 border-b border-blue-900/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 font-medium transition-all relative
              ${
                isActive
                  ? "text-white border-b-2 border-yellow-500"
                  : "text-blue-300 hover:text-blue-100"
              }
            `}
          >
            <Icon size={20} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
