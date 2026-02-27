import { Resend } from 'resend';
import { t, Locale } from '../i18n/t';

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const sendVerificationCode = async (email: string, code: string, locale?: Locale) => {
  const lang = locale || 'en';
  try {
    const { data, error } = await resend.emails.send({
      from: 'LhamsDJ <noreply@lhamsdj.com>',
      to: email,
      subject: t(lang, 'email.recoverySubject'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${t(lang, 'email.recoveryTitle')}</h2>
          <p>${t(lang, 'email.verificationCode')}</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>${t(lang, 'email.codeExpiry')}</p>
          <p style="color: #666; font-size: 12px;">${t(lang, 'email.ignoreIfNotYou')}</p>
        </div>
      `
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return false;
    }

    console.log(`[RESEND] Email sent to ${email}`, data);
    return true;
  } catch (err) {
    console.error('[RESEND ERROR]', err);
    return false;
  }
};

export const sendEmailVerification = async (email: string, token: string, locale?: Locale) => {
  const verifyUrl = `${FRONTEND_URL}/auth/verify?token=${token}`;
  const lang = locale || 'en';

  try {
    const { data, error } = await resend.emails.send({
      from: 'LhamsDJ <noreply@lhamsdj.com>',
      to: email,
      subject: t(lang, 'email.verifySubject'),
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #111827; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">LhamsDJ</h1>
          </div>
          <div style="padding: 40px 32px; text-align: center;">
            <div style="width: 64px; height: 64px; background: #ECFDF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
              <span style="font-size: 32px;">✉️</span>
            </div>
            <h2 style="color: #111827; font-size: 22px; margin: 0 0 12px;">${t(lang, 'email.verifyTitle')}</h2>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
              ${t(lang, 'email.verifyDescription')}
            </p>
            <a href="${verifyUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              ${t(lang, 'email.verifyButton')}
            </a>
            <p style="color: #9CA3AF; font-size: 13px; margin-top: 32px;">
              ${t(lang, 'email.verifyExpiry')}
            </p>
          </div>
          <div style="background: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              ${t(lang, 'email.ignoreIfNotYou')}
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return false;
    }

    console.log(`[RESEND] Verification email sent to ${email}`, data);
    return true;
  } catch (err) {
    console.error('[RESEND ERROR]', err);
    return false;
  }
};