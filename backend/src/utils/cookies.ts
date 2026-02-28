import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';
const ACCESS_MAX_AGE = 60 * 60 * 1000;         // 1 hora
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: ACCESS_MAX_AGE,
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
