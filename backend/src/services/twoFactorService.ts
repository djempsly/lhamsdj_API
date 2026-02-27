import * as otplib from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const APP_NAME = 'LhamsDJ';

export const TwoFactorService = {
  async generateSecret(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const secret = otplib.generateSecret();
    const otpauthUrl = otplib.generateURI({ issuer: APP_NAME, label: user.email, secret });
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

    return { secret, qrCode, otpauthUrl };
  },

  async enable(userId: number, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new Error('2FA_NOT_SETUP');

    const isValid = otplib.verifySync({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new Error('INVALID_2FA_CODE');

    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } }),
      prisma.twoFactorBackupCode.createMany({
        data: backupCodes.map(code => ({ userId, code })),
      }),
    ]);

    return { backupCodes };
  },

  async verify(userId: number, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) return false;

    if (otplib.verifySync({ token, secret: user.twoFactorSecret })) return true;

    const backup = await prisma.twoFactorBackupCode.findFirst({
      where: { userId, code: token, used: false },
    });
    if (backup) {
      await prisma.twoFactorBackupCode.update({ where: { id: backup.id }, data: { used: true } });
      return true;
    }

    return false;
  },

  async disable(userId: number) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId } }),
    ]);
  },
};
