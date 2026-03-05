import crypto from 'crypto';

const ALG = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 16;
const TAG_LEN = 16;
const SALT_LEN = 16;

function getKey(): Buffer {
  const secret = process.env.PII_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('PII_ENCRYPTION_KEY must be set and at least 32 characters');
  }
  return crypto.scryptSync(secret, 'pii-salt', KEY_LEN);
}

/**
 * Encrypt PII for storage (e.g. phone, sensitive fields).
 * Returns base64: iv:tag:ciphertext (IV and auth tag for verification).
 */
export function encryptPii(plain: string): string {
  if (!plain) return '';
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

/**
 * Decrypt PII.
 */
export function decryptPii(encrypted: string): string {
  if (!encrypted) return '';
  try {
    const key = getKey();
    const buf = Buffer.from(encrypted, 'base64');
    if (buf.length < IV_LEN + TAG_LEN) return encrypted;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const data = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALG, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data).toString('utf8') + decipher.final('utf8');
  } catch {
    return encrypted;
  }
}

/**
 * Mask for logs (email: a***@b.com, phone: +1***4567).
 */
export function maskForLog(value: string, type: 'email' | 'phone'): string {
  if (!value || value.length < 4) return '***';
  if (type === 'email') {
    const [local, domain] = value.split('@');
    if (!domain) return value.slice(0, 1) + '***';
    return (local?.slice(0, 1) ?? '') + '***@' + domain;
  }
  return value.slice(0, 2) + '***' + value.slice(-4);
}
