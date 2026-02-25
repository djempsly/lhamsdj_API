import { Request, Response } from 'express';
import { VendorService } from '../services/vendorService';
import { registerVendorSchema, updateVendorSchema, adminUpdateVendorSchema } from '../validation/vendorSchema';
import { parsePagination } from '../utils/pagination';
import { audit, AuditActions } from '../lib/audit';

export const registerVendor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const data = registerVendorSchema.parse(req.body);
    const vendor = await VendorService.register(userId, data);
    res.status(201).json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyVendorProfile = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.getMyVendorProfile(req.user?.id!);
    res.json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateVendorProfile = async (req: Request, res: Response) => {
  try {
    const data = updateVendorSchema.parse(req.body);
    const vendor = await VendorService.updateProfile(req.user?.id!, data);
    res.json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVendorPublicProfile = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.getPublicProfile(String(req.params.slug));
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
    res.json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorProducts = async (req: Request, res: Response) => {
  try {
    const vendorId = Number(req.params.vendorId);
    const pagination = parsePagination(req.query as any);
    const result = await VendorService.getVendorProducts(vendorId, pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorDashboard = async (req: Request, res: Response) => {
  try {
    const data = await VendorService.getVendorDashboard(req.user?.id!);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminGetVendors = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any);
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const result = await VendorService.adminGetAll(pagination, statusParam);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateVendor = async (req: Request, res: Response) => {
  try {
    const vendorId = Number(req.params.id);
    const data = adminUpdateVendorSchema.parse(req.body);
    const vendor = await VendorService.adminUpdate(vendorId, data);
    await audit({ userId: req.user?.id, action: 'VENDOR_STATUS_CHANGED', entity: 'Vendor', entityId: vendorId, details: JSON.stringify(data), ip: req.ip });
    res.json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
