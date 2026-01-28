import { axiosClient } from "@/lib/http";

export const logoutUser = async () => {
  const response = await axiosClient.post("/api/logout");
  return response.data;
};
