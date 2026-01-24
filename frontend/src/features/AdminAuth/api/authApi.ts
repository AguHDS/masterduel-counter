export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: {
    id: number;
    username: string;
  };
}

export const loginAdmin = async (
  credentials: AdminLoginCredentials
): Promise<AdminLoginResponse> => {
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/signAsAdmin`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Authentication failed",
      };
    }

    return data;
  } catch (error) {
    console.error("Error during login:", error);
    return {
      success: false,
      message: "An error occurred during login",
    };
  }
};
