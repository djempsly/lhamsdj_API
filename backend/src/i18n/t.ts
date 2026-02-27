import en from './en.json';
import fr from './fr.json';

const messages: Record<string, Record<string, string>> = { en, fr };

export type Locale = 'en' | 'fr';
export const defaultLocale: Locale = 'en';
export const supportedLocales: Locale[] = ['en', 'fr'];

export function t(locale: string | undefined, key: string, params?: Record<string, string | number>): string {
  const lang = supportedLocales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  let msg = messages[lang]?.[key] ?? messages[defaultLocale]?.[key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return msg;
}
