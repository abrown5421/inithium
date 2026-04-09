export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkWriteBody<T> {
  items: T[];
}

export interface BulkUpdateBody<T> {
  filter: Partial<T>;
  update: Partial<T>;
}

export interface BulkDeleteBody {
  ids: string[];
}