import { axiosClient } from "./axiosClient";
import type {
  Profile,
  Publication,
  Report,
} from "@/features/admin-panel/types/adminPanelTypes";

// Tipos de respuesta de la API
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Tipos específicos para las operaciones de admin
interface ChangeCredentialsRequest {
  email?: string;
  username?: string;
  password?: string;
}

interface DeleteInstanceResponse {
  success: boolean;
  deletedCount?: number;
  message?: string;
}

// Funciones de la API de administración
export const adminHttpApi = {
  // ========== USUARIOS ==========
  // 1. Obtener todos los usuarios
  async getUsers(): Promise<Profile[]> {
    const { data } =
      await axiosClient.get<ApiResponse<Profile[]>>("/api/admin/users");
    return data.data;
  },

  // 2. Eliminar usuario
  async deleteUser(userId: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
  },

  // 3. Obtener instancias de un usuario
  async getUserInstances(userId: string): Promise<Publication[]> {
    const { data } = await axiosClient.get<ApiResponse<Publication[]>>(
      `/api/admin/users/${userId}/instances`,
    );
    return data.data;
  },

  // 4. Eliminar instancia específica de usuario
  async deleteUserInstance(
    userId: string,
    instanceId: string,
  ): Promise<DeleteInstanceResponse> {
    const { data } = await axiosClient.delete<
      ApiResponse<DeleteInstanceResponse>
    >(`/api/admin/users/${userId}/instances/${instanceId}`);
    return data.data;
  },

  // 5. Cambiar credenciales de usuario
  async changeUserCredentials(
    userId: string,
    credentials: ChangeCredentialsRequest,
  ): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/credentials`,
      credentials,
    );
  },

  // 6. Banear usuario
  async banUser(userId: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/ban`,
      {},
    );
  },

  // 7. Desbanear usuario
  async unbanUser(userId: string): Promise<void> {
    await axiosClient.put<ApiResponse<void>>(
      `/api/admin/users/${userId}/unban`,
      {},
    );
  },

  // ========== REPORTES ==========
  // 8. Obtener todos los reportes
  async getReports(): Promise<Report[]> {
    const { data } =
      await axiosClient.get<ApiResponse<Report[]>>("/api/admin/reports");
    return data.data;
  },

  // 9. Eliminar reporte
  async deleteReport(reportId: string): Promise<void> {
    await axiosClient.delete<ApiResponse<void>>(
      `/api/admin/reports/${reportId}`,
    );
  },
};

export default adminHttpApi;
