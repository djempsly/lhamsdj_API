import { Request, Response, NextFunction } from 'express';
import { t } from '../i18n/t';

/**
 * Validates magic bytes of uploaded files.
 * MIME type can be spoofed; magic bytes cannot.
 */

interface MagicSignature {
  mime: string;
  bytes: number[];
  offset?: number;
}

const SIGNATURES: MagicSignature[] = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
];

function matchesMagicBytes(buffer: Buffer, signature: MagicSignature): boolean {
  const offset = signature.offset || 0;
  if (buffer.length < offset + signature.bytes.length) return false;

  for (let i = 0; i < signature.bytes.length; i++) {
    if (buffer[offset + i] !== signature.bytes[i]) return false;
  }

  if (signature.mime === 'image/webp') {
    if (buffer.length < 12) return false;
    const webpMark = buffer.slice(8, 12).toString('ascii');
    return webpMark === 'WEBP';
  }

  return true;
}

function isValidImage(buffer: Buffer): { valid: boolean; detectedMime: string | null } {
  for (const sig of SIGNATURES) {
    if (matchesMagicBytes(buffer, sig)) {
      return { valid: true, detectedMime: sig.mime };
    }
  }
  return { valid: false, detectedMime: null };
}

export const validateImageBytes = (req: Request, res: Response, next: NextFunction) => {
  const files: Express.Multer.File[] = [];

  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) files.push(...req.files);
    else Object.values(req.files).flat().forEach((f) => files.push(f));
  }

  if (files.length === 0) return next();

  for (const file of files) {
    if (!file.buffer && !(file as any).location) {
      continue;
    }

    if (file.buffer) {
      const result = isValidImage(file.buffer);
      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: t(req.locale, 'middleware.invalidMagicBytes', { name: file.originalname }),
        });
      }

      const declaredMime = file.mimetype.toLowerCase();
      if (result.detectedMime && declaredMime !== result.detectedMime) {
        return res.status(400).json({
          success: false,
          message: t(req.locale, 'middleware.mismatchMime', {
            name: file.originalname,
            declared: declaredMime,
            detected: result.detectedMime,
          }),
        });
      }
    }
  }

  next();
};

export const validateImageExtension = (req: Request, res: Response, next: NextFunction) => {
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const files: Express.Multer.File[] = [];
  if (req.file) files.push(req.file);
  if (req.files && Array.isArray(req.files)) files.push(...req.files);

  for (const file of files) {
    const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: t(req.locale, 'middleware.invalidExtension', {
          ext,
          allowed: ALLOWED_EXTENSIONS.join(', '),
        }),
      });
    }

    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: t(req.locale, 'middleware.invalidFilename'),
      });
    }
  }

  next();
};
