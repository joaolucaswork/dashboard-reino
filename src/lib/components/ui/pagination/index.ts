import Pagination from "./pagination.svelte";

export { Pagination };
export default Pagination;

// Types for pagination
export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
}
