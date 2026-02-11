import type { ReportCreateDTO, Report } from "@/domain/Report";

export interface ReportRepository {
  /** Create a new report */
  createReport(data: ReportCreateDTO): Promise<Report>;
  /** Get report by ID */
  getReportById(id: number): Promise<Report | null>;
}
