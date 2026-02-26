import { prisma } from '../lib/prisma';
import { buildPaginatedResponse, PaginationResult } from '../utils/pagination';

export const AuditService = {
  async list(pagination: PaginationResult, filters?: { action?: string | undefined; entity?: string | undefined; userId?: number | undefined }) {
    const where: any = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.userId != null) where.userId = filters.userId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },
};
