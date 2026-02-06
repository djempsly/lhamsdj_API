import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { createProductSchema, updateProductSchema } from '../validation/productSchema';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const product = await ProductService.create(validatedData);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAll();
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await ProductService.getBySlug(slug as string);
    
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);
    const product = await ProductService.update(Number(id), validatedData);
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ProductService.delete(Number(id));
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'No se pudo eliminar el producto (¿Tiene pedidos asociados?)' });
  }
};