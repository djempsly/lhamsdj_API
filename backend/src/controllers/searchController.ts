import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';

export const advancedSearch = async (req: Request, res: Response) => {
  try {
    const params: Parameters<typeof SearchService.advancedSearch>[0] = {
      sort: 'newest',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    if (req.query.q) params.q = req.query.q as string;
    if (req.query.categoryId) params.categoryId = Number(req.query.categoryId);
    if (req.query.minPrice) params.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) params.maxPrice = Number(req.query.maxPrice);
    if (req.query.minRating) params.minRating = Number(req.query.minRating);
    if (req.query.vendorId) params.vendorId = Number(req.query.vendorId);
    if (req.query.inStock === 'true') params.inStock = true;
    if (req.query.sort) params.sort = req.query.sort as string;
    const result = await SearchService.advancedSearch(params);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const autoComplete = async (req: Request, res: Response) => {
  try {
    const data = await SearchService.getAutoComplete(req.query.q as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const data = await SearchService.getRecommendations(Number(req.params.productId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackView = async (req: Request, res: Response) => {
  try {
    if (req.user?.id) {
      await SearchService.trackView(req.user.id, Number(req.params.productId));
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(200).json({ success: true });
  }
};

export const getRecentlyViewed = async (req: Request, res: Response) => {
  try {
    const data = await SearchService.getRecentlyViewed(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
