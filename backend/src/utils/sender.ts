import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationCode = async (email: string, code: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'LhamsDJ <noreply@lhams.com>',
      to: email,
      subject: 'Código de recuperación - LhamsDJ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>Este código expira en 15 minutos.</p>
          <p style="color: #666; font-size: 12px;">Si no solicitaste este código, ignora este mensaje.</p>
        </div>
      `
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return false;
    }

    console.log(`[RESEND] Email enviado a ${email}`, data);
    return true;
  } catch (err) {
    console.error('[RESEND ERROR]', err);
    return false;
  }
};