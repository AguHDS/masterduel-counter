export interface VerifyAuthResponse {
  success: boolean;
  authenticated: boolean;
  admin?: {
    id: number;
    username: string;
  };
}

export const verifyAuth = async (): Promise<VerifyAuthResponse> => {
  try {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
    const url = `${API_BASE}/api/verifyAuth`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies
    });

    if (!response.ok) {
      return {
        success: false,
        authenticated: false,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying auth:", error);
    return {
      success: false,
      authenticated: false,
    };
  }
};
