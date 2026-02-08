import axios from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { authInterceptor } from "./interceptors/auth";
import { errorInterceptor } from "./interceptors/error";
import { getBackendUrl } from "@/lib/config/urlHelpers";

const API_BASE_URL = getBackendUrl();

const REQUEST_TIMEOUT = 30000;

const createAxiosClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    withCredentials: true, // Include cookies in all requests
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - adds authentication and modifies requests before sending
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => authInterceptor(config),
    (error: unknown) => Promise.reject(error),
  );

  // Response interceptor - handles errors globally
  client.interceptors.response.use(
    (response) => response,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: AxiosError<any>) => errorInterceptor(error),
  );

  return client;
};

export const axiosClient = createAxiosClient();

// Export type for use in API functions
export type { AxiosInstance };
