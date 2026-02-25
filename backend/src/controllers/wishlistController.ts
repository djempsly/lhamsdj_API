import { Request, Response } from 'express';
import { WishlistService } from '../services/wishlistService';
import { z } from 'zod';

const toggleSchema = z.object({ productId: z.number().int().positive() });

export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = toggleSchema.parse(req.body);
    const result = await WishlistService.toggle(req.user?.id!, productId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyWishlist = async (req: Request, res: Response) => {
  try {
    const items = await WishlistService.getMyWishlist(req.user?.id!);
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkWishlist = async (req: Request, res: Response) => {
  try {
    const inWishlist = await WishlistService.isInWishlist(req.user?.id!, Number(req.params.productId));
    res.json({ success: true, data: { inWishlist } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
