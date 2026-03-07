import { adminHttpApi } from "@/lib/http/adminApi";

export const adminApi = {
  searchUsers: adminHttpApi.searchUsers,
  getUser: adminHttpApi.getUser,
  deleteUser: adminHttpApi.deleteUser,
  getUserInstances: adminHttpApi.getUserInstances,
  deleteUserInstance: adminHttpApi.deleteUserInstance,
  changeUserCredentials: adminHttpApi.changeUserCredentials,
  banUser: adminHttpApi.banUser,
  unbanUser: adminHttpApi.unbanUser,
  
  // Reports
  getReports: adminHttpApi.getReports,
  deleteReport: adminHttpApi.deleteReport,

  // Tracking
  getTotalUsers: adminHttpApi.getTotalUsers,
  getAllUsers: (page: number, limit: number, sortBy?: string, sortOrder?: string, search?: string) => 
    adminHttpApi.getAllUsers(page, limit, sortBy, sortOrder, search),
};