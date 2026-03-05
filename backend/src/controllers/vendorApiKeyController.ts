import { Request, Response } from 'express';
import { VendorApiKeyService, VALID_SCOPES } from '../services/vendorApiKeyService';

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendorId!;
    const { name, scopes } = req.body;
    if (!name || !Array.isArray(scopes)) return res.status(400).json({ success: false, message: 'name and scopes required' });
    const result = await VendorApiKeyService.create(vendorId, String(name), scopes);
    res.status(201).json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const listApiKeys = async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendorId!;
    const list = await VendorApiKeyService.list(vendorId);
    res.json({ success: true, data: list });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const revokeApiKey = async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendorId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    await VendorApiKeyService.revoke(vendorId, id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getScopes = (_req: Request, res: Response) => {
  res.json({ success: true, data: VALID_SCOPES });
};
