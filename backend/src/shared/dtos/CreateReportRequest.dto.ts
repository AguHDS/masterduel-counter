export interface CreateReportDTO {
  reportedUserId?: string;
  reportedInstanceId?: number;
  reason: string;
}

export interface CreateReportResponse {
  success: boolean;
  data?: {
    reportId: number;
  };
  message?: string;
  error?: string;
}
