export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logoutAdmin = async (): Promise<LogoutResponse> => {
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/logout`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Logout failed",
      };
    }

    return data;
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      success: false,
      message: "An error occurred during logout",
    };
  }
};
