import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { parsePagination } from '../utils/pagination';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any, 'createdAt');
    const filters: { action?: string; entity?: string; userId?: number } = {};
    if (typeof req.query.action === 'string') filters.action = req.query.action;
    if (typeof req.query.entity === 'string') filters.entity = req.query.entity;
    if (req.query.userId != null) filters.userId = Number(req.query.userId);
    const result = await AuditService.list(pagination, Object.keys(filters).length ? filters : undefined);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
