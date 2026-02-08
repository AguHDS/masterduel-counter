import { adminHttpApi } from "@/lib/http/adminApi";

export const adminApi = {
  getUser: adminHttpApi.getUser,
  deleteUser: adminHttpApi.deleteUser,
  getUserInstances: adminHttpApi.getUserInstances,
  deleteUserInstance: adminHttpApi.deleteUserInstance,
  changeUserCredentials: adminHttpApi.changeUserCredentials,
  banUser: adminHttpApi.banUser,
  unbanUser: adminHttpApi.unbanUser,
  getReports: adminHttpApi.getReports,
  deleteReport: adminHttpApi.deleteReport,
};
