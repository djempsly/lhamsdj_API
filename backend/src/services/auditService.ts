import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { buildPaginatedResponse, PaginationResult } from '../utils/pagination';

interface AuditFilters {
  action?: string;
  entity?: string;
  userId?: number;
}

export const AuditService = {
  async list(pagination: PaginationResult, filters?: AuditFilters) {
    const where: Prisma.AuditLogWhereInput = {};
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
