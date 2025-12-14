import { PagedResult } from "@/types/page-result";
import { Robot } from "@/types/robot";
import { robotsHttp } from "@/utils/http";



export const getAllRobots = async () => {
  try {
    const response = await robotsHttp.get<PagedResult<Robot>>('/robots');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRobotById = async (id: string) => {
  const response = await robotsHttp.get<Robot>(`/robots/${id}`);
  return response.data;
};

export const getRobotsByAccountId = async (accountId: string) => {
  try {
    const response = await robotsHttp.get<PagedResult<Robot>>(`/robots`, { params: { accountId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRobot = async (
  robotData: Omit<Robot, 'id' | 'createdDate' | 'lastUpdate'>
) => {
  try {
    const response = await robotsHttp.post('/robots', robotData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRobot = async (id: string, robotData: Partial<Omit<Robot, 'id' | 'createdDate' | 'lastUpdate'>>) => {
    try {
        const response = await robotsHttp.patch(`/robots/${id}`, robotData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRobot = async (id: string) => {
  try {
    const response = await robotsHttp.delete(`/robots/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRobotStatus = async (id: string, status: number) => {
  try {
    const response = await robotsHttp.patch(`/robots/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};