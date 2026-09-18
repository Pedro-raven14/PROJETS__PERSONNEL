// Helper de pagination réutilisable dans tous les services
// Usage : const { skip, take } = paginate(page, limit)
// Réponse : { data, total, page, totalPages }

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export function paginate(page = 1, limit = 10): { skip: number; take: number } {
  const safePage  = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100); // max 100 par page
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

export function buildResult<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 10,
): PaginatedResult<T> {
  return {
    data,
    total,
    page:       Math.max(1, page),
    totalPages: Math.ceil(total / Math.min(Math.max(1, limit), 100)),
  };
}
