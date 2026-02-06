import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { createCategorySchema, updateCategorySchema } from '../validation/categorySchema';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await CategoryService.create(validatedData);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    // Manejo de error de duplicados o validación
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getAll();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await CategoryService.getBySlug(slug as string);
    
    if (!category) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    
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
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CategoryService.delete(Number(id));
    res.json({ success: true, message: 'Categoría eliminada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};