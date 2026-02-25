import { Request, Response } from 'express';
import { ProductService, ProductFilters } from '../services/productService';
import { createProductSchema, updateProductSchema } from '../validation/productSchema';
import { parsePagination } from '../utils/pagination';
import { convertProductPrices } from '../utils/priceFormatter';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any, 'createdAt');

    const filters: ProductFilters = {};
    if (req.query.search) filters.search = String(req.query.search);
    if (req.query.categoryId) filters.categoryId = Number(req.query.categoryId);
    if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
    if (req.query.inStock === 'true') filters.inStock = true;

    const result = await ProductService.getAll(pagination, filters);

    const currency = req.geo?.currency || 'USD';
    if (currency !== 'USD') {
      result.data = await convertProductPrices(result.data, currency);
    }

    res.json({ success: true, ...result, currency, country: req.geo?.country });
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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const product = await ProductService.create(validatedData);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: 'No se pudo eliminar el producto' });
  }
};
