import { ReportRepository } from "@/domain/ports/ReportRepository.js";
import type { ReportCreateDTO, Report } from "@/domain/Report.js";
import { PrismaClient } from "@prisma/client";

export class SqliteReportRepository implements ReportRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createReport(data: ReportCreateDTO): Promise<Report> {
    const report = await this.prisma.report.create({
      data: {
        reporterId: data.reporterId,
        reportedUserId: data.reportedUserId || null,
        reportedInstanceId: data.reportedInstanceId || null,
        reason: data.reason,
        status: "pending",
      },
    });

    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reportedInstanceId: report.reportedInstanceId,
      reason: report.reason,
      status: report.status as "pending" | "resolved" | "dismissed",
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }

  async getReportById(id: number): Promise<Report | null> {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return null;
    }

    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reportedInstanceId: report.reportedInstanceId,
      reason: report.reason,
      status: report.status as "pending" | "resolved" | "dismissed",
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
