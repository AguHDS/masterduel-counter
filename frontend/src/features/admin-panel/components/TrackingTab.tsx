import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

interface TotalUsersResponse {
  success: boolean;
  data: {
    total: number;
  };
}

const fetchTotalUsers = async (): Promise<number> => {
  const response = await axios.get<TotalUsersResponse>(
    `${API_BASE_URL}/api/admin/tracking/total-users`,
    { withCredentials: true }
  );
  return response.data.data.total;
};

export const TrackingTab = () => {
  const { data: totalUsers, isLoading, error } = useQuery({
    queryKey: ["admin", "totalUsers"],
    queryFn: fetchTotalUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300">Failed to load tracking data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">User Tracking</h2>
        <p className="text-blue-300 text-sm">
          Monitor registered users and platform statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/20 border border-blue-500/30 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-blue-300 mb-1">
            Total Registered Users
          </h3>
          <p className="text-4xl font-bold text-white">
            {totalUsers?.toLocaleString() || 0}
          </p>
        </div>

        {/* Placeholder cards for future stats */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/20 border border-slate-500/20 rounded-lg p-6 shadow-lg opacity-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-500/10 border border-slate-500/30 rounded-lg">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">
            Active Users (Coming Soon)
          </h3>
          <p className="text-4xl font-bold text-slate-300">--</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/20 border border-slate-500/20 rounded-lg p-6 shadow-lg opacity-50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-500/10 border border-slate-500/30 rounded-lg">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">
            New Users (30d) (Coming Soon)
          </h3>
          <p className="text-4xl font-bold text-slate-300">--</p>
        </div>
      </div>
    </div>
  );
};
