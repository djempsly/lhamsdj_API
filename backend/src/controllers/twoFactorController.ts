import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactorService';

export const setup2FA = async (req: Request, res: Response) => {
  try {
    const result = await TwoFactorService.generateSecret(req.user!.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });
    const result = await TwoFactorService.enable(req.user!.id, token);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { token, userId } = req.body;
    const isValid = await TwoFactorService.verify(userId, token);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    await TwoFactorService.disable(req.user!.id);
    res.json({ success: true, message: '2FA disabled' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await (await import('../lib/prisma')).prisma.activeSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { lastActive: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const revokeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (await import('../lib/prisma')).prisma.activeSession.deleteMany({
      where: { id: Number(id), userId: req.user!.id },
    });
    res.json({ success: true, message: 'Session revoked' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
