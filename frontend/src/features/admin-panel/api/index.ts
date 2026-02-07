import { adminHttpApi } from "@/lib/http/adminApi";

export const adminApi = {
  getUsers: adminHttpApi.getUsers,
  deleteUser: adminHttpApi.deleteUser,
  getUserInstances: adminHttpApi.getUserInstances,
  deleteUserInstance: adminHttpApi.deleteUserInstance,
  changeUserCredentials: adminHttpApi.changeUserCredentials,
  banUser: adminHttpApi.banUser,
  unbanUser: adminHttpApi.unbanUser,
  getReports: adminHttpApi.getReports,
  deleteReport: adminHttpApi.deleteReport,
};
