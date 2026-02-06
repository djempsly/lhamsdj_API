import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { createReviewSchema } from '../validation/reviewSchema';

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const validatedData = createReviewSchema.parse(req.body);
    
    const review = await ReviewService.create(userId, validatedData);
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewService.getByProduct(Number(productId));
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role!; // Necesitamos el rol para saber si es Admin
    const { id } = req.params;

    await ReviewService.delete(userId, userRole, Number(id));
    res.json({ success: true, message: 'Reseña eliminada' });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};