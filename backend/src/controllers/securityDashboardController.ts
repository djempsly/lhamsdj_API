import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSecurityDashboard = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [loginFailed24h, loginSuccess24h, accountLocked24h, recentAudit, activeSessions, pendingKyc] = await Promise.all([
      prisma.auditLog.count({ where: { action: 'LOGIN_FAILED', createdAt: { gte: last24h } } }),
      prisma.auditLog.count({ where: { action: 'LOGIN_SUCCESS', createdAt: { gte: last24h } } }),
      prisma.auditLog.count({ where: { action: 'ACCOUNT_LOCKED', createdAt: { gte: last24h } } }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: last24h } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { id: true, action: true, entity: true, entityId: true, userId: true, ip: true, createdAt: true },
      }),
      prisma.refreshToken.count({ where: { revoked: false, expiresAt: { gt: now } } }),
      prisma.vendor.count({ where: { kycStatus: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        last24h: { loginFailed: loginFailed24h, loginSuccess: loginSuccess24h, accountLocked: accountLocked24h },
        last7d: {},
        activeSessions,
        pendingKyc,
        recentAudit,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};
