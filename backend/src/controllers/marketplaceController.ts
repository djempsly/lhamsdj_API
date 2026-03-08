import { Request, Response } from 'express';
import { LoyaltyService } from '../services/loyaltyService';
import { FlashSaleService } from '../services/flashSaleService';
import { GiftCardService } from '../services/giftCardService';
import { BundleService } from '../services/bundleService';
import { QuestionService } from '../services/questionService';
import { NewsletterService } from '../services/newsletterService';
import { DealOfTheDayService } from '../services/dealOfTheDayService';

// Loyalty
export const getLoyaltyProfile = async (req: Request, res: Response) => {
  try {
    const data = await LoyaltyService.getProfile(req.user!.id);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const getLoyaltyHistory = async (req: Request, res: Response) => {
  try {
    const data = await LoyaltyService.getHistory(req.user!.id);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const redeemPoints = async (req: Request, res: Response) => {
  try {
    const data = await LoyaltyService.redeemPoints(req.user!.id, req.body.points);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const generateReferralCode = async (req: Request, res: Response) => {
  try {
    const code = await LoyaltyService.generateReferralCode(req.user!.id);
    res.json({ success: true, data: { code } });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

// Flash Sales
export const getActiveFlashSales = async (_req: Request, res: Response) => {
  try {
    const data = await FlashSaleService.getActive();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const getAllFlashSales = async (_req: Request, res: Response) => {
  try {
    const data = await FlashSaleService.getAll();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const createFlashSale = async (req: Request, res: Response) => {
  try {
    const data = await FlashSaleService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const toggleFlashSale = async (req: Request, res: Response) => {
  try {
    const data = await FlashSaleService.toggle(Number(req.params.id));
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const deleteFlashSale = async (req: Request, res: Response) => {
  try {
    await FlashSaleService.delete(Number(req.params.id));
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

// Gift Cards
export const createGiftCard = async (req: Request, res: Response) => {
  try {
    const data = await GiftCardService.create({ ...req.body, buyerId: req.user!.id });
    res.status(201).json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const validateGiftCard = async (req: Request, res: Response) => {
  try {
    const data = await GiftCardService.validate(req.body.code);
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const getAllGiftCards = async (_req: Request, res: Response) => {
  try {
    const data = await GiftCardService.getAll();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

// Bundles
export const getBundles = async (_req: Request, res: Response) => {
  try {
    const data = await BundleService.getAll();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const getBundleBySlug = async (req: Request, res: Response) => {
  try {
    const slug = typeof req.params.slug === 'string' ? req.params.slug : req.params.slug?.[0] ?? '';
    const data = await BundleService.getBySlug(slug);
    if (!data) return res.status(404).json({ success: false });
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const createBundle = async (req: Request, res: Response) => {
  try {
    const data = await BundleService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const deleteBundle = async (req: Request, res: Response) => {
  try {
    await BundleService.delete(Number(req.params.id));
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

// Q&A
export const getProductQuestions = async (req: Request, res: Response) => {
  try {
    const data = await QuestionService.getByProduct(Number(req.params.productId));
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const data = await QuestionService.create(
      Number(req.params.productId),
      req.user!.id,
      req.body.question
    );
    res.status(201).json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const data = await QuestionService.answer(
      Number(req.params.id),
      req.body.answer,
      req.user!.id
    );
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};

// Newsletter
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    await NewsletterService.subscribe(req.body.email, req.body.name, req.locale);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  try {
    await NewsletterService.unsubscribe(req.body.email);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
};
export const getNewsletterSubscribers = async (_req: Request, res: Response) => {
  try {
    const data = await NewsletterService.getAll();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

// Deal of the day (Ofertas del día)
export const getDealOfTheDay = async (_req: Request, res: Response) => {
  try {
    const data = await DealOfTheDayService.getActive();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

export const getDealOfTheDayAdmin = async (_req: Request, res: Response) => {
  try {
    const data = await DealOfTheDayService.list();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

export const addDealProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.body.productId);
    if (!Number.isInteger(productId)) return res.status(400).json({ success: false, message: 'productId required' });
    const data = await DealOfTheDayService.add(productId);
    res.status(201).json({ success: true, data });
  } catch (e: unknown) {
    const msg = (e as Error).message;
    if (msg === 'Product not found') return res.status(404).json({ success: false, message: msg });
    if (msg === 'Product already in deal of the day') return res.status(400).json({ success: false, message: msg });
    res.status(500).json({ success: false, message: msg });
  }
};

export const removeDealProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    await DealOfTheDayService.remove(id);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

export const reorderDealOfTheDay = async (req: Request, res: Response) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : [];
    await DealOfTheDayService.reorder(ids);
    const data = await DealOfTheDayService.list();
    res.json({ success: true, data });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};

export const sendDealToSubscribers = async (_req: Request, res: Response) => {
  try {
    const result = await NewsletterService.sendDealToSubscribers();
    res.json({ success: true, data: result });
  } catch (e: unknown) {
    res.status(500).json({ success: false, message: (e as Error).message });
  }
};
