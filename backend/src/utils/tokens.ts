import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be defined in production');
}
const SECRET = JWT_SECRET || 'dev_fallback_only';

interface TokenPayload {
  id: number;
  role: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}

export async function storeRefreshToken(userId: number, token: string, userAgent?: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, token: hashedToken, expiresAt, userAgent: userAgent?.substring(0, 255) ?? null },
  });
}

export async function validateRefreshToken(token: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const stored = await prisma.refreshToken.findFirst({
    where: { token: hashedToken, expiresAt: { gt: new Date() }, revoked: false },
    include: { user: { select: { id: true, role: true, email: true, isActive: true } } },
  });

  if (!stored) return null;
  return stored;
}

export async function revokeRefreshToken(token: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.updateMany({
    where: { token: hashedToken },
    data: { revoked: true },
  });
}

export async function revokeAllUserTokens(userId: number) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign({ email, purpose: 'email-verify' }, SECRET, { expiresIn: '24h' });
}

export function verifyEmailVerificationToken(token: string): { email: string } {
  const payload = jwt.verify(token, SECRET) as { email: string; purpose: string };
  if (payload.purpose !== 'email-verify') throw new Error('Invalid token purpose');
  return { email: payload.email };
}
