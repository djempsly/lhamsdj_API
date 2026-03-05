import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from '../utils/tokens';

export const OAuthService = {
  async findOrCreateGoogleUser(googleUser: { id: string; email: string; name?: string; picture?: string }) {
    const email = googleUser.email?.toLowerCase();
    if (!email) throw new Error('EMAIL_REQUIRED');

    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, email: true, name: true, isActive: true, isVerified: true, twoFactorEnabled: true, twoFactorSecret: true },
    });

    const ROLES_REQUIRING_MFA = ['ADMIN', 'VENDOR'];

    if (!user) {
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
      const name = ((googleUser.name && String(googleUser.name).trim()) || email.split('@')[0] || email) as string;
      const created = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          phone: null,
          country: null,
          role: 'USER',
          isActive: true,
          isVerified: true,
        },
        select: { id: true, role: true, email: true, name: true, isActive: true, isVerified: true, twoFactorEnabled: true, twoFactorSecret: true },
      });
      user = created;
    }

    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.isActive) throw new Error('Cuenta desactivada');
    const mustEnroll2FA = ROLES_REQUIRING_MFA.includes(user.role) && !user.twoFactorEnabled;
    if (mustEnroll2FA) {
      return { user, requires2FA: true, mustEnroll2FA: true };
    }
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return { user, requires2FA: true };
    }
    return { user, requires2FA: false };
  },
};
