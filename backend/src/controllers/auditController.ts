import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { parsePagination, PaginationQuery } from '../utils/pagination';
import { auditLogQuerySchema } from '../validation/adminSchema';
import { z } from 'zod';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as PaginationQuery, 'createdAt');
    const parsed = auditLogQuerySchema.parse(req.query);

    const filters = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== undefined)
    ) as { action?: string; entity?: string; userId?: number };

    const result = await AuditService.list(pagination, Object.keys(filters).length ? filters : undefined);
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Validation error' });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
};
