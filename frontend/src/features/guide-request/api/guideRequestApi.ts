import axios from "axios";
import { getBackendUrl } from "@/lib/config/urlHelpers";
import type {
  GuideRequest,
  GuideRequestListResult,
  GuideRequestCounts,
  CreateGuideRequestPayload,
} from "../types/guideRequest.types";

const API_URL = getBackendUrl();

export const guideRequestApi = {
  async getRequests(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<GuideRequestListResult> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const res = await axios.get(`${API_URL}/api/guide-requests`, { params });
    return res.data.data;
  },

  async getRecentRequests(limit = 15): Promise<GuideRequest[]> {
    const res = await axios.get(`${API_URL}/api/guide-requests/recent`, {
      params: { limit },
    });
    return res.data.data;
  },

  async getRequestById(id: number): Promise<GuideRequest> {
    const res = await axios.get(`${API_URL}/api/guide-requests/${id}`);
    return res.data.data;
  },

  async createRequest(payload: CreateGuideRequestPayload): Promise<GuideRequest> {
    const res = await axios.post(`${API_URL}/api/guide-requests`, payload, {
      withCredentials: true,
    });
    return res.data.data;
  },

  async takeRequest(requestId: number): Promise<GuideRequest> {
    const res = await axios.post(
      `${API_URL}/api/guide-requests/${requestId}/take`,
      {},
      { withCredentials: true },
    );
    return res.data.data;
  },

  async cancelTakeRequest(requestId: number): Promise<GuideRequest> {
    const res = await axios.post(
      `${API_URL}/api/guide-requests/${requestId}/cancel-take`,
      {},
      { withCredentials: true },
    );
    return res.data.data;
  },

  async fulfillRequest(requestId: number, instanceId: number): Promise<GuideRequest> {
    const res = await axios.post(
      `${API_URL}/api/guide-requests/${requestId}/fulfill`,
      { instanceId },
      { withCredentials: true },
    );
    return res.data.data;
  },

  async getRequestCounts(): Promise<GuideRequestCounts> {
    const res = await axios.get(`${API_URL}/api/guide-requests/counts`);
    return res.data.data;
  },
};
