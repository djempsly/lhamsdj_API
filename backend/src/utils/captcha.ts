const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TURNSTILE_SECRET_KEY is required in production');
    }
    return true;
  }

  try {
    const body: Record<string, string> = { secret: TURNSTILE_SECRET, response: token };
    if (ip) body.remoteip = ip;

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
