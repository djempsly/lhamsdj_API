import { Request, Response, NextFunction } from 'express';
import { supportedLocales, defaultLocale, Locale } from '../i18n/t';

declare global {
  namespace Express {
    interface Request {
      locale: Locale;
    }
  }
}

export function localeMiddleware(req: Request, _res: Response, next: NextFunction) {
  const cookieLocale = req.cookies?.locale;
  if (supportedLocales.includes(cookieLocale)) {
    req.locale = cookieLocale;
    return next();
  }

  const acceptLang = req.headers['accept-language'] || '';
  const preferred = acceptLang.split(',').map(s => s.split(';')[0]?.trim().slice(0, 2) ?? '');
  const match = preferred.find(l => supportedLocales.includes(l as Locale));
  req.locale = (match as Locale) || defaultLocale;
  next();
}
