import { Request, Response, NextFunction } from 'express';
import { VendorApiKeyService } from '../services/vendorApiKeyService';

export function apiKeyAuth(requiredScope?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-api-key'] ?? req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!key || typeof key !== 'string') {
      return res.status(401).json({ success: false, message: 'X-Api-Key or Bearer required' });
    }
    const vendorId = await VendorApiKeyService.validateAndGetVendor(key.trim(), requiredScope);
    if (vendorId == null) {
      return res.status(403).json({ success: false, message: 'Invalid or insufficient API key' });
    }
    (req as any).vendorId = vendorId;
    (req as any).authType = 'api_key';
    next();
  };
}
