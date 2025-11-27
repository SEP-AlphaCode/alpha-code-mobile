import { PagedResult } from "@/types/page-result";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getActions,
  getDances,
  getExpressions,
  getExtendedActions,
  getSkills,
} from "../api/api";
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";

export function useAllActions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  // First, get the first page to know total pages
  const firstPageQuery = useQuery({
    queryKey: ['actions', { ...params, page: 1 }],
    queryFn: () => getActions({ ...params, page: 1 }),
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 0;

  // Then fetch all pages in parallel
  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['actions', { ...params, page }],
      queryFn: () => getActions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1, // Page 1 is already fetched
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;

    const pages: { [page: number]: PagedResult<Action> } = {};
    pages[1] = firstPageQuery.data;

    allPagesQueries.forEach((query, index) => {
      if (query.data) {
        pages[index + 2] = query.data; // +2 because index starts at 0 and we already have page 1
      }
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return {
    allPagesData,
    isLoading,
    isError,
    totalPages,
    refetch: () => {
      firstPageQuery.refetch();
      allPagesQueries.forEach(query => query.refetch());
    },
  };
}

export function useDances(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  // First, get the first page to know total pages
  const firstPageQuery = useQuery({
    queryKey: ['dances', { ...params, page: 1 }],
    queryFn: () => getDances({ ...params, page: 1 }),
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 0;

  // Then fetch all pages in parallel
  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['dances', { ...params, page }],
      queryFn: () => getDances({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1, // Page 1 is already fetched
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;

    const pages: { [page: number]: PagedResult<Dance> } = {};
    pages[1] = firstPageQuery.data;

    allPagesQueries.forEach((query, index) => {
      if (query.data) {
        pages[index + 2] = query.data; // +2 because index starts at 0 and we already have page 1
      }
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return {
    allPagesData,
    isLoading,
    isError,
    totalPages,
    refetch: () => {
      firstPageQuery.refetch();
      allPagesQueries.forEach(query => query.refetch());
    },
  };
}

export function useExpressions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  // First, get the first page to know total pages
  const firstPageQuery = useQuery({
    queryKey: ['expressions', { ...params, page: 1 }],
    queryFn: () => getExpressions({ ...params, page: 1 }),
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 0;

  // Then fetch all pages in parallel
  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['expressions', { ...params, page }],
      queryFn: () => getExpressions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1, // Page 1 is already fetched
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;

    const pages: { [page: number]: PagedResult<Expression> } = {};
    pages[1] = firstPageQuery.data;

    allPagesQueries.forEach((query, index) => {
      if (query.data) {
        pages[index + 2] = query.data; // +2 because index starts at 0 and we already have page 1
      }
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return {
    allPagesData,
    isLoading,
    isError,
    totalPages,
    refetch: () => {
      firstPageQuery.refetch();
      allPagesQueries.forEach(query => query.refetch());
    },
  };
}

export function useExtendedActions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  // First, get the first page to know total pages
  const firstPageQuery = useQuery({
    queryKey: ['extendedActions', { ...params, page: 1 }],
    queryFn: () => getExtendedActions({ ...params, page: 1 }),
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 0;

  // Then fetch all pages in parallel
  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['extendedActions', { ...params, page }],
      queryFn: () => getExtendedActions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1, // Page 1 is already fetched
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;

    const pages: { [page: number]: PagedResult<ExtendedAction> } = {};
    pages[1] = firstPageQuery.data;

    allPagesQueries.forEach((query, index) => {
      if (query.data) {
        pages[index + 2] = query.data; // +2 because index starts at 0 and we already have page 1
      }
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return {
    allPagesData,
    isLoading,
    isError,
    totalPages,
    refetch: () => {
      firstPageQuery.refetch();
      allPagesQueries.forEach(query => query.refetch());
    },
  };
}

export function useSkills(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  // First, get the first page to know total pages
  const firstPageQuery = useQuery({
    queryKey: ['skills', { ...params, page: 1 }],
    queryFn: () => getSkills({ ...params, page: 1 }),
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 0;

  // Then fetch all pages in parallel
  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['skills', { ...params, page }],
      queryFn: () => getSkills({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1, // Page 1 is already fetched
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;

    const pages: { [page: number]: PagedResult<Skill> } = {};
    pages[1] = firstPageQuery.data;

    allPagesQueries.forEach((query, index) => {
      if (query.data) {
        pages[index + 2] = query.data; // +2 because index starts at 0 and we already have page 1
      }
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return {
    allPagesData,
    isLoading,
    isError,
    totalPages,
    refetch: () => {
      firstPageQuery.refetch();
      allPagesQueries.forEach(query => query.refetch());
    },
  };
}