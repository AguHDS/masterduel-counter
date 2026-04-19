export interface Report {
  id: number;
  reporterId: string;
  reportedUserId?: string | null;
  reportedInstanceId?: number | null;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportCreateDTO {
  reporterId: string;
  reportedUserId?: string | null;
  reportedInstanceId?: number | null;
  reason: string;
}

export interface ReportWithDetails extends Report {
  reporterName: string;
  reporterEmail: string;
  reportedUserName?: string;
  reportedInstanceTitle?: string;
  reportedInstanceAuthorId?: string | null;
  reportedInstanceAuthorName?: string | null;
  reportedInstanceArchetypeId?: number | null;
  reportedInstanceArchetypeName?: string | null;
  reportedInstanceGuideType?: "COUNTER" | "DECK" | null;
}
