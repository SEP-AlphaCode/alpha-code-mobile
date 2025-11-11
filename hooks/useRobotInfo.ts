// src/features/robots/hooks/useRobotInfo.ts
import { getRobotInfo } from "@/api/robot/robot_info_api";
import { RobotInfoResponse } from "@/types/robot";
import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";

type AnnotatedRobotInfoResponse = RobotInfoResponse & { __requestedSerial?: string };

export const useRobotInfo = () => {
  const useGetRobotInfo = (
    serial: string,
    timeout: number = 10,
    options: { enabled?: boolean } = {}
  ) => {
    return useQuery<AnnotatedRobotInfoResponse>({
      queryKey: ["robot-info", serial, timeout],
      queryFn: async () => {
        const data = await getRobotInfo(serial, timeout);
        return { ...data, __requestedSerial: serial } as AnnotatedRobotInfoResponse;
      },
      enabled: options.enabled !== false && !!serial,
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 2,
    });
  };

  const useGetMultipleRobotInfo = (
    serials: string[], // Mảng serials được truyền vào
    // 💡 Đổi tên thành interval để dễ hiểu hơn là timeout của API
    interval: number = 3,
    options: { enabled?: boolean } = {}
  ) => {
    const queries = serials.map((serial) => ({
      queryKey: ["robot-info", serial, 10], // Giữ timeout API là 10s trong key
      // queryFn gọi API với timeout cứng là 10s (có thể chỉnh)
      queryFn: async () => {
        const data = await getRobotInfo(serial, 10);
        return { ...data, __requestedSerial: serial } as AnnotatedRobotInfoResponse;
      },

      enabled: options.enabled !== false && !!serial,

      // ✅ Kích hoạt Polling: Refetch mỗi 'interval' giây (3000ms)
      refetchInterval: interval * 1000,

      // Cấu hình cache cho việc polling:
      // Dữ liệu được coi là 'stale' ngay lập tức để luôn refetch theo interval
      staleTime: 0,
      // Giảm retry vì polling liên tục
      retry: 1,
      retryDelay: 1000,
    }));

    const results = useQueries({ queries }) as UseQueryResult<AnnotatedRobotInfoResponse, unknown>[];

    // Chuẩn hóa kết quả - ưu tiên __requestedSerial để ghép chính xác
    return results.map((r, idx) => {
      const serialFromResponse = r.data?.__requestedSerial;
      const serialFromMap = serialFromResponse ?? serials[idx];

      return ({
        serial: serialFromMap,
        data: r.data,
        isLoading: r.isLoading,
        isError: r.isError,
        error: r.error,
        status:
          r.isError || r.data?.status === "error"
            ? "offline"
            : "online",
      });
    });
  };

  return {
    useGetRobotInfo,
    useGetMultipleRobotInfo,
  };
};
