
import { useQuery } from "@tanstack/react-query";
import {
    getActions,
    getDances,
    getExpressions,
    getExtendedActions,
    getSkills,
} from "../api/getList";
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";
import { PagedResult } from "../types/pagedResult";

export function useActions(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Action>, Error>({
        queryKey: ["actions", params],
        queryFn: () => getActions(params),
    });
}

export function useDances(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Dance>, Error>({
        queryKey: ["dances", params],
        queryFn: () => getDances(params),
    });
}

export function useExpressions(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Expression>, Error>({
        queryKey: ["expressions", params],
        queryFn: () => getExpressions(params),
    });
}

export function useExtendedActions(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<ExtendedAction>, Error>({
        queryKey: ["extendedActions", params],
        queryFn: () => getExtendedActions(params),
    });
}

export function useSkills(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Skill>, Error>({
        queryKey: ["skills", params],
        queryFn: () => getSkills(params),
    });
}
