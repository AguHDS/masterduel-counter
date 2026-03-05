import type { ReportCreateDTO } from "@/domain/Report.js";

export interface ReportService {
  /** Create a new report */
  createReport(data: ReportCreateDTO): Promise<{
    success: boolean;
    reportId?: number;
    message: string;
  }>;
}
