import { PagedResult } from "./pagedResult";

export interface ActionPanelProps<T> {
    data?: PagedResult<T>;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    contentDetail: (item: T, index: number) => React.ReactNode;
    listItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
    dimension: {
        width: number;
        height: number;
    };
}