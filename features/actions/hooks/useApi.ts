import { PagedResult } from "@/types/page-result";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"; // 👈 Thêm useMutation, useQueryClient
import { useMemo } from "react";

// --- Import API Actions (Cũ) ---
import {
  getActions,
  getDances,
  getExpressions,
  getExtendedActions,
  getSkills,
} from "../api/api";

// --- Import API Joystick (Mới - cần đảm bảo đường dẫn đúng) ---
import {
  createJoystick,
  deleteJoystick,
  getJoystickByAccountRobot,
  patchJoystick,
  updateJoystick
} from "../api/api";

// --- Import Types ---
import { Action, Dance, Expression, ExtendedAction, Skill } from "../types/actions";
import { Joystick, JoystickResponse } from "../types/joystick";

// ==========================================
// 1. Hooks lấy dữ liệu (Action, Dance, etc.)
// ==========================================

export function useAllActions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  const firstPageQuery = useQuery({
    queryKey: ['actions', { ...params, page: 1 }],
    queryFn: async () => {
      console.log('📡 Fetching actions with params:', params);
      const result = await getActions({ ...params, page: 1 });
      console.log('✅ Actions response:', result);
      return result;
    },
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 1; // Default to 1 instead of 0

  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['actions', { ...params, page }],
      queryFn: () => getActions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1,
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;
    const pages: { [page: number]: PagedResult<Action> } = {};
    pages[1] = firstPageQuery.data;
    allPagesQueries.forEach((query, index) => {
      if (query.data) pages[index + 2] = query.data;
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return { allPagesData, isLoading, isError, totalPages, refetch: () => { firstPageQuery.refetch(); allPagesQueries.forEach(query => query.refetch()); }, };
}

export function useDances(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  const firstPageQuery = useQuery({
    queryKey: ['dances', { ...params, page: 1 }],
    queryFn: async () => {
      console.log('📡 Fetching dances with params:', params);
      const result = await getDances({ ...params, page: 1 });
      console.log('✅ Dances response:', result);
      return result;
    },
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 1;

  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['dances', { ...params, page }],
      queryFn: () => getDances({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1,
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;
    const pages: { [page: number]: PagedResult<Dance> } = {};
    pages[1] = firstPageQuery.data;
    allPagesQueries.forEach((query, index) => {
      if (query.data) pages[index + 2] = query.data;
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return { allPagesData, isLoading, isError, totalPages, refetch: () => { firstPageQuery.refetch(); allPagesQueries.forEach(query => query.refetch()); }, };
}

export function useExpressions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  const firstPageQuery = useQuery({
    queryKey: ['expressions', { ...params, page: 1 }],
    queryFn: async () => {
      console.log('📡 Fetching expressions with params:', params);
      const result = await getExpressions({ ...params, page: 1 });
      console.log('✅ Expressions response:', result);
      return result;
    },
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 1;

  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['expressions', { ...params, page }],
      queryFn: () => getExpressions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1,
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;
    const pages: { [page: number]: PagedResult<Expression> } = {};
    pages[1] = firstPageQuery.data;
    allPagesQueries.forEach((query, index) => {
      if (query.data) pages[index + 2] = query.data;
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return { allPagesData, isLoading, isError, totalPages, refetch: () => { firstPageQuery.refetch(); allPagesQueries.forEach(query => query.refetch()); }, };
}

export function useExtendedActions(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  const firstPageQuery = useQuery({
    queryKey: ['extendedActions', { ...params, page: 1 }],
    queryFn: async () => {
      console.log('📡 Fetching extendedActions with params:', params);
      const result = await getExtendedActions({ ...params, page: 1 });
      console.log('✅ Extended actions response:', result);
      return result;
    },
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 1;

  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['extendedActions', { ...params, page }],
      queryFn: () => getExtendedActions({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1,
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;
    const pages: { [page: number]: PagedResult<ExtendedAction> } = {};
    pages[1] = firstPageQuery.data;
    allPagesQueries.forEach((query, index) => {
      if (query.data) pages[index + 2] = query.data;
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return { allPagesData, isLoading, isError, totalPages, refetch: () => { firstPageQuery.refetch(); allPagesQueries.forEach(query => query.refetch()); }, };
}

export function useSkills(params: { size?: number; robotModelId?: string, shouldRun?: boolean }) {
  const firstPageQuery = useQuery({
    queryKey: ['skills', { ...params, page: 1 }],
    queryFn: async () => {
      console.log('📡 Fetching skills with params:', params);
      const result = await getSkills({ ...params, page: 1 });
      console.log('✅ Skills response:', result);
      return result;
    },
    staleTime: Infinity,
    enabled: params.shouldRun,
  });

  const totalPages = firstPageQuery.data?.total_pages || 1;

  const allPagesQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => i + 1).map(page => ({
      queryKey: ['skills', { ...params, page }],
      queryFn: () => getSkills({ ...params, page }),
      staleTime: Infinity,
      enabled: params.shouldRun && totalPages > 0 && page !== 1,
    })),
  });

  const allPagesData = useMemo(() => {
    if (!firstPageQuery.data) return;
    const pages: { [page: number]: PagedResult<Skill> } = {};
    pages[1] = firstPageQuery.data;
    allPagesQueries.forEach((query, index) => {
      if (query.data) pages[index + 2] = query.data;
    });
    return pages;
  }, [firstPageQuery.data, allPagesQueries]);

  const isLoading = firstPageQuery.isLoading || allPagesQueries.some(query => query.isLoading);
  const isError = firstPageQuery.isError || allPagesQueries.some(query => query.isError);

  return { allPagesData, isLoading, isError, totalPages, refetch: () => { firstPageQuery.refetch(); allPagesQueries.forEach(query => query.refetch()); }, };
}

// ==========================================
// 2. Hook quản lý Joystick (CRUD)
// ==========================================

export const useJoystick = () => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["joysticks"];

  // 1. GET: Lấy danh sách Config
  const useGetJoysticks = ({ accountId, robotId }: { accountId?: string; robotId?: string }) => {
    return useQuery<JoystickResponse>({
      queryKey: [...QUERY_KEY, "by-account-robot", accountId, robotId],
      queryFn: async () => {
        if (!accountId || !robotId) return { joysticks: [] };
        return await getJoystickByAccountRobot(accountId, robotId);
      },
      enabled: !!accountId && !!robotId, 
      staleTime: 1000 * 60 * 5, // Cache 5 phút
      retry: 2, 
    });
  };

  // 2. CREATE
  const useCreateJoystick = () => {
    return useMutation({
      mutationFn: createJoystick,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
    });
  };

  // 3. UPDATE (PUT)
  const useUpdateJoystick = () => {
    return useMutation({
      mutationFn: ({ id, joystickData }: { 
        id: string; 
        joystickData: Omit<Joystick, 'id' | 'createdDate' | 'lastUpdate'> 
      }) => updateJoystick(id, joystickData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
    });
  };

  // 4. PATCH
  const usePatchJoystick = () => {
    return useMutation({
      mutationFn: ({ id, joystickData }: { 
        id: string; 
        joystickData: Partial<Omit<Joystick, 'id' | 'createdDate' | 'lastUpdate'>> 
      }) => patchJoystick(id, joystickData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
    });
  };

  // 5. DELETE
  const useDeleteJoystick = () => {
    return useMutation({
      mutationFn: deleteJoystick,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
    });
  };

  return {
    useGetJoysticks,
    useCreateJoystick,
    useUpdateJoystick,
    usePatchJoystick,
    useDeleteJoystick,
  };
};