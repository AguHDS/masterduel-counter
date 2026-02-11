export interface AdminReportItem {
  id: number;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId?: string | null;
  reportedUserName?: string | null;
  reportedInstanceId?: number | null;
  reportedInstanceTitle?: string | null;
  reportedInstanceAuthorId?: string | null;
  reportedInstanceAuthorName?: string | null;
  reportedInstanceArchetypeId?: number | null;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReportsResponse {
  success: boolean;
  data: {
    reports: AdminReportItem[];
    total: number;
  };
  error?: string;
}
