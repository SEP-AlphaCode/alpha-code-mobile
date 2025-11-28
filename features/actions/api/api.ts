import { PagedResult } from "@/types/page-result";
import { activitiesHttp, pythonHttp } from "@/utils/http";
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";
// 🟢 Đừng quên import types cho Joystick
import { Joystick, JoystickResponse } from "../types/joystick";

// --- ACTIONS / DANCES / EXPRESSIONS / SKILLS ---

export async function getActions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Action>> {
    const res = await activitiesHttp.get<PagedResult<Action>>("/actions", { params });
    return res.data;
}

export async function getDances(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Dance>> {
    const res = await activitiesHttp.get<PagedResult<Dance>>("/dances", { params });
    return res.data;
}

export async function getExpressions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Expression>> {
    const res = await activitiesHttp.get<PagedResult<Expression>>("/expressions", { params });
    return res.data;
}

export async function getExtendedActions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<ExtendedAction>> {
    const res = await activitiesHttp.get<PagedResult<ExtendedAction>>("/extended-actions", { params });
    return res.data;
}

export async function getSkills(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Skill>> {
    const res = await activitiesHttp.get<PagedResult<Skill>>("/skills", { params });
    return res.data;
}

// --- 🟢 JOYSTICK API ---

export async function getJoystickByAccountRobot(accountId: string, robotId: string): Promise<JoystickResponse> {
    const res = await activitiesHttp.get<JoystickResponse | Joystick[]>("/joysticks/by-account-robot", {
        params: { accountId, robotId }
    });

    // Xử lý trường hợp API trả về mảng trực tiếp thay vì object { joysticks: [] }
    if (Array.isArray(res.data)) {
        return { joysticks: res.data };
    }
    return res.data;
}

export async function createJoystick(joystickData: Omit<Joystick, 'id' | 'createdDate' | 'lastUpdate' | 'status'>): Promise<Joystick> {
    const res = await activitiesHttp.post<Joystick>("/joysticks", joystickData);
    return res.data;
}

export async function updateJoystick(id: string, joystickData: Omit<Joystick, 'id' | 'createdDate' | 'lastUpdate'>): Promise<Joystick> {
    const res = await activitiesHttp.put<Joystick>(`/joysticks/${id}`, joystickData);
    return res.data;
}

export async function patchJoystick(id: string, joystickData: Partial<Omit<Joystick, 'id' | 'createdDate' | 'lastUpdate'>>): Promise<Joystick> {
    const res = await activitiesHttp.patch<Joystick>(`/joysticks/${id}`, joystickData);
    return res.data;
}

export async function deleteJoystick(id: string): Promise<void> {
    await activitiesHttp.delete(`/joysticks/${id}`);
}

// --- COMMAND ---

export async function sendCommand(serial: string, params: { type: string, lang?: string, data: any }) {
    const res = await pythonHttp.post("/websocket/command/" + serial, params, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    return res.data;
}