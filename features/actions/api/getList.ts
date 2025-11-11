import { actionHttp } from "@/utils/action-https";
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";
import { PagedResult } from "../types/pagedResult";

export async function getActions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Action>> {
	const res = await actionHttp.get<PagedResult<Action>>("/actions", { params });
	return res.data;
}

export async function getDances(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Dance>> {
	const res = await actionHttp.get<PagedResult<Dance>>("/dances", { params });
	return res.data;
}

export async function getExpressions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Expression>> {
	const res = await actionHttp.get<PagedResult<Expression>>("/expressions", { params });
	return res.data;
}

export async function getExtendedActions(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<ExtendedAction>> {
	const res = await actionHttp.get<PagedResult<ExtendedAction>>("/extendedactions", { params });
	return res.data;
}

export async function getSkills(params: { size?: number; page?: number; robotModelId?: string }): Promise<PagedResult<Skill>> {
	const res = await actionHttp.get<PagedResult<Skill>>("/skills", { params });
	return res.data;
}
