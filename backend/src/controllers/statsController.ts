import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const data = await StatsService.getDashboard();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
