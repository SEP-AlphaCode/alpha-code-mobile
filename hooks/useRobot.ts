import {
    createRobot,
    deleteRobot,
    getAllRobots,
    getRobotById,
    getRobotsByAccountId,
    updateRobot,
    updateRobotStatus
} from "@/api/robot/robot-api";
import { PagedResult } from "@/types/page-result";
import { Robot } from "@/types/robot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRobot = () => {
    const queryClient = useQueryClient();

    const useGetAllRobots = () => {
        return useQuery<PagedResult<Robot>>({
            queryKey: ["robots"],
            queryFn: getAllRobots
        });
    };

    const useGetRobotById = (id: string) => {
        return useQuery<Robot>({
            queryKey: ["robots", id],
            queryFn: () => getRobotById(id)
        });
    };

    const useGetRobotsByAccountId = (accountId: string) => {
        return useQuery<PagedResult<Robot>>({
            queryKey: ["robots", "account", accountId],
            queryFn: () => getRobotsByAccountId(accountId)
        });
    };

    const useCreateRobot = () => {
        return useMutation<Robot, Error, Omit<Robot, 'id' | 'createdDate' | 'lastUpdate'>>({
            mutationFn: createRobot,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["robots"] });
            }
        });
    };

    const useUpdateRobot = () => {
        return useMutation<Robot, Error, { id: string; data: Partial<Omit<Robot, 'id' | 'createdDate' | 'lastUpdate'>> }>({
            mutationFn: ({ id, data }) => updateRobot(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["robots"] });
            }
        });
    };

    const useDeleteRobot = () => {
        return useMutation<void, Error, string>({
            mutationFn: deleteRobot,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["robots"] });
            }
        });
    };

    const useUpdateRobotStatus = () => {
        return useMutation<Robot, Error, { id: string; status: number }>({
            mutationFn: ({ id, status }) => updateRobotStatus(id, status),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["robots"] });
            }
        });
    };

    return {
        useGetAllRobots,
        useGetRobotById,
        useGetRobotsByAccountId,
        useCreateRobot,
        useUpdateRobot,
        useDeleteRobot,
        useUpdateRobotStatus
    };
};
