import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';
import logger from '../lib/logger';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const data = await StatsService.getDashboard();
    res.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ err: error }, 'Failed to fetch dashboard stats');
    res.status(500).json({ success: false, message: msg });
  }
};
