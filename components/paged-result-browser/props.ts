import { PagedResult } from "@/types/page-result"
import { QueryClient } from "@tanstack/react-query"
import { ReactNode } from "react"

export type PagedResultBrowserProps<T> = {
    /**
     * A single page of result
     */
    data?: PagedResult<T>,
    /**
     * Describe how an item is rendered in a list
     * @param item data of the item
     * @param isSelected whether if this item is currently selected
     * @returns 
     */
    listItemFn: (item: T, id: string, isSelected: boolean) => ReactNode,
    /**
     * Describe how the selected item is rendered
     * @param item data of the item
     * @returns 
     */
    itemDetailFn: (item: T) => ReactNode,
    rowCount: number,
    columnCount: number,
    isLoading: boolean,
    onPageChange: (page: number) => void,
    onItemSelect: (item: T) => void
    /**
    * React Query client for cache access
    */
    queryClient: QueryClient,
    /**
     * Query key prefix for cache lookup
     */
    queryKey: string,
    /**
     * Current query parameters
     */
    currentParams: { page: number; size: number; robotModelId?: string }
}