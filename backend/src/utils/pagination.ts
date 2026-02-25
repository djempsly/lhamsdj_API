export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export function parsePagination(query: PaginationQuery, defaultSort = 'createdAt'): PaginationResult {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sortBy = query.sort || defaultSort;
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
}

export function buildPaginatedResponse<T>(data: T[], total: number, pagination: PaginationResult): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
}
