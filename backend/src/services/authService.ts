import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { sendVerificationCode, sendEmailVerification } from '../utils/sender';
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/tokens';
import { Locale } from '../i18n/t';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

export const AuthService = {
  async register(data: { email: string; password: string; name: string; phone: string; country: string }, locale?: Locale) {
    const { email, password, name, phone, country } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('DUPLICATE_EMAIL');

    const hashedPassword = await bcrypt.hash(password, 12);

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(verifyCode, 10);
    const verifyCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        name, email, password: hashedPassword, phone, country,
        role: 'USER', isActive: true, isVerified: false,
        verifyCode: hashedCode, verifyCodeExpiry,
      },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    const verificationToken = generateEmailVerificationToken(email);
    await sendEmailVerification(email, verificationToken, verifyCode, locale);

    return { user: newUser };
  },

  async verifyEmail(token: string) {
    const { email } = verifyEmailVerificationToken(token);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.isVerified) return { alreadyVerified: true };

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verifyCode: null, verifyCodeExpiry: null },
    });

    return { alreadyVerified: false };
  },

  async verifyByCode(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.isVerified) return { alreadyVerified: true };
    if (!user.verifyCode || !user.verifyCodeExpiry) throw new Error('NO_PENDING_VERIFICATION');
    if (new Date() > user.verifyCodeExpiry) throw new Error('CODE_EXPIRED');

    const valid = await bcrypt.compare(code, user.verifyCode);
    if (!valid) throw new Error('INVALID_CODE');

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verifyCode: null, verifyCodeExpiry: null },
    });

    return { alreadyVerified: false };
  },

  async login(data: { email: string; password: string }, userAgent?: string) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('Credenciales inválidas');
    if (!user.isActive) throw new Error('Cuenta desactivada');
    if (!user.isVerified) throw new Error('EMAIL_NOT_VERIFIED');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Cuenta bloqueada. Intenta en ${minutesLeft} minutos.`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: attempts };
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        updateData.loginAttempts = 0;
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });

      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      if (remaining > 0) {
        throw new Error(`Credenciales inválidas. ${remaining} intentos restantes.`);
      }
      throw new Error('Cuenta bloqueada por demasiados intentos. Intenta en 30 minutos.');
    }

    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const { password: _, resetToken: __, resetTokenExpiry: ___, twoFactorSecret: ____, ...safeUser } = user;
      return { user: safeUser, requires2FA: true, accessToken: '', refreshToken: '' };
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, refreshToken, userAgent);

    const { password: _, resetToken: __, resetTokenExpiry: ___, twoFactorSecret: ____, ...safeUser } = user;
    return { user: safeUser, requires2FA: false, accessToken, refreshToken };
  },

  async loginWith2FA(userId: number, token: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new Error('2FA_NOT_SETUP');

    const { TwoFactorService } = await import('./twoFactorService');
    const isValid = await TwoFactorService.verify(userId, token);
    if (!isValid) throw new Error('INVALID_2FA_CODE');

    const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, refreshToken, userAgent);

    const { password: _, resetToken: __, resetTokenExpiry: ___, twoFactorSecret: ____, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(currentRefreshToken: string, userAgent?: string) {
    const stored = await validateRefreshToken(currentRefreshToken);
    if (!stored || !stored.user.isActive) throw new Error('Sesión expirada');

    await revokeRefreshToken(currentRefreshToken);

    const accessToken = generateAccessToken({ id: stored.user.id, role: stored.user.role, email: stored.user.email });
    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(stored.user.id, newRefreshToken, userAgent);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    await revokeRefreshToken(refreshToken);
  },

  async logoutAll(userId: number) {
    await revokeAllUserTokens(userId);
  },

  async forgotPassword(email: string, locale?: Locale) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    const hashedToken = await bcrypt.hash(code, 10);

    await prisma.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    await sendVerificationCode(email, code, locale);
    return true;
  },

  async resetPassword(data: { email: string; code: string; newPassword: string }) {
    const { email, code, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) throw new Error('Solicitud inválida');
    if (new Date() > user.resetTokenExpiry) throw new Error('El código ha expirado');

    const validCode = await bcrypt.compare(code, user.resetToken);
    if (!validCode) throw new Error('Código incorrecto');

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null, loginAttempts: 0, lockedUntil: null },
    });

    await revokeAllUserTokens(user.id);
    return true;
  },

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, country: true,
        profileImage: true, role: true, isActive: true, isVerified: true, createdAt: true,
      },
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },
};
