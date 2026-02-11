import { useMutation } from "@tanstack/react-query";
import { reportApi } from "@/lib/http/reportApi";

interface CreateReportParams {
  reportedUserId?: string;
  reportedInstanceId?: number;
  reason: string;
}

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (params: CreateReportParams) => reportApi.createReport(params),
  });
};
