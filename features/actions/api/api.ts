
import { PagedResult } from "@/types/page-result";
import { activitiesHttp, pythonHttp } from "@/utils/http";
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";


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

export async function sendCommand(serial: string, params: { type: string, lang?: string, data: any }) {
	const res = await pythonHttp.post("/websocket/command/" + serial, params, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});
	return res.data;
}