
import { PagedResult } from "@/types/page-result";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getActions,
  getDances,
  getExpressions,
  getExtendedActions,
  getSkills,
} from "../api/api";
import { Dance, Expression, ExtendedAction, Skill } from "../types/actions";


export function useActionsWithAdjacent(params: { size?: number; page?: number; robotModelId?: string, shouldRun?: boolean }) {
  const currentPage = params.page || 1;
  // Prefetch adjacent pages
  const queries = useQueries({
    queries: [
      // Previous page
      {
        queryKey: ['actions', { ...params, page: currentPage - 1 }],
        queryFn: () => getActions({ ...params, page: currentPage - 1 }),
        staleTime: Infinity,
        enabled: currentPage > 1 && params.shouldRun, // Only fetch if previous page exists
      },
      // Current page
      {
        queryKey: ['actions', { ...params, page: currentPage }],
        queryFn: () => getActions({ ...params, page: currentPage }),
        staleTime: Infinity,
        enabled: params.shouldRun
      },
      // Next page
      {
        queryKey: ['actions', { ...params, page: currentPage + 1 }],
        queryFn: () => getActions({ ...params, page: currentPage + 1 }),
        staleTime: Infinity,
        enabled: params.shouldRun        
      },
    ],
  });

  const [prevPageQuery, currentPageQuery, nextPageQuery] = queries;

  return {
    // Current page data
    data: currentPageQuery.data,
    isLoading: currentPageQuery.isLoading,
    isError: currentPageQuery.isError,
    
    // Adjacent pages for smooth transitions
    adjacentPages: {
      previous: prevPageQuery.data,
      next: nextPageQuery.data,
    },
    
    // Loading states for adjacent pages
    isLoadingAdjacent: prevPageQuery.isLoading || nextPageQuery.isLoading,
    
    // All refetch functions
    refetch: () => {
      prevPageQuery.refetch();
      currentPageQuery.refetch();
      nextPageQuery.refetch();
    },
  };
}

export function useDances(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Dance>, Error>({
        queryKey: ["dances", params],
        queryFn: () => getDances(params),
        staleTime: Infinity
    });
}

export function useExpressions(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Expression>, Error>({
        queryKey: ["expressions", params],
        queryFn: () => getExpressions(params),
        staleTime: Infinity
    });
}

export function useExtendedActions(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<ExtendedAction>, Error>({
        queryKey: ["extendedActions", params],
        queryFn: () => getExtendedActions(params),
        staleTime: Infinity
    });
}

export function useSkills(params: { size?: number; page?: number; robotModelId?: string }) {
    return useQuery<PagedResult<Skill>, Error>({
        queryKey: ["skills", params],
        queryFn: () => getSkills(params),
        staleTime: Infinity
    });
}
