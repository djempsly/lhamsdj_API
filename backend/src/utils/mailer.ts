import { Resend } from 'resend';
import logger from '../lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'LhamsDJ <noreply@lhamsdj.com>';

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn({ to, subject }, 'Email skipped: RESEND_API_KEY not set');
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      logger.error({ error, to, subject }, 'Email send failed');
      return false;
    }
    logger.info({ to, subject }, 'Email sent');
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, 'Email send error');
    return false;
  }
}
