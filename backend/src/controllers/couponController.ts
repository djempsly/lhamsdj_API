import { Request, Response } from 'express';
import { CouponService } from '../services/couponService';
import { z } from 'zod';

const createCouponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const data = createCouponSchema.parse(req.body);
    const coupon = await CouponService.create(data);
    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = validateCouponSchema.parse(req.body);
    const result = await CouponService.validate(code, subtotal);
    res.json({ success: true, data: { discount: result.discount, couponId: result.coupon.id, type: result.coupon.type, value: result.coupon.value } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await CouponService.getAll();
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await CouponService.toggleActive(Number(req.params.id));
    res.json({ success: true, data: coupon });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await CouponService.delete(Number(req.params.id));
    res.json({ success: true, message: 'Cupón eliminado' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
