import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // Cookie lasts 7 days (same as refresh token); the JWT inside expires in 1h.
  // This ensures the middleware always sees the cookie, while apiFetch
  // handles the JWT expiry transparently via /auth/refresh.
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE,
    path: '/api/v1/auth',
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/' });
  res.clearCookie('refresh_token', { httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/api/v1/auth' });
}
