export type PagedResult<T> = {
  data: T[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};
