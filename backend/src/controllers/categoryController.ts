import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { CategoryService } from '../services/categoryService';
import { createCategorySchema, updateCategorySchema } from '../validation/categorySchema';
import * as cache from '../lib/cache';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await CategoryService.create(validatedData);
    cache.del(cache.CACHE_KEYS.CATEGORIES_ALL);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const cached = cache.get<Awaited<ReturnType<typeof CategoryService.getAll>>>(cache.CACHE_KEYS.CATEGORIES_ALL);
    if (cached) return res.json({ success: true, data: cached });
    const categories = await CategoryService.getAll();
    cache.set(cache.CACHE_KEYS.CATEGORIES_ALL, categories, 5 * 60 * 1000);
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await CategoryService.getBySlug(slug as string);
    
    if (!category) return res.status(404).json({ success: false, message: t(req.locale, 'category.notFound') });
    
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await CategoryService.update(Number(id), validatedData);
    cache.del(cache.CACHE_KEYS.CATEGORIES_ALL);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CategoryService.delete(Number(id));
    cache.del(cache.CACHE_KEYS.CATEGORIES_ALL);
    res.json({ success: true, message: t(req.locale, 'category.deleted') });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};