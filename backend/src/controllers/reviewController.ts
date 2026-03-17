import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { ReviewService } from '../services/reviewService';
import { createReviewSchema } from '../validation/reviewSchema';
import { parsePagination } from '../utils/pagination';
import { prisma } from '../lib/prisma';

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
    const pagination = parsePagination(req.query as any, 'createdAt');
    const result = await ReviewService.getByProduct(Number(productId), pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const userRole = req.user?.role!;
    const { id } = req.params;
    await ReviewService.delete(userId, userRole, Number(id));
    res.json({ success: true, message: t(req.locale, 'review.deleted') });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const getReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, profileImage: true } },
          product: { select: { name: true, slug: true, images: { take: 1 } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateReview = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const review = await prisma.review.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
