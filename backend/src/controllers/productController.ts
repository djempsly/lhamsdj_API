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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getById(Number(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.duplicate(Number(req.params.id));
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkAction = async (req: Request, res: Response) => {
  try {
    const { ids, action, params } = req.body;
    if (!ids?.length || !action) return res.status(400).json({ success: false, message: 'ids and action required' });
    const result = await ProductService.bulkAction(ids, action, params);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const data = await ProductService.getLowStock(threshold);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await ProductService.getAnalytics(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const data = await ProductService.getPriceHistory(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderImages = async (req: Request, res: Response) => {
  try {
    const { imageIds } = req.body;
    if (!imageIds?.length) return res.status(400).json({ success: false, message: 'imageIds required' });
    await ProductService.reorderImages(Number(req.params.id), imageIds);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportProducts = async (req: Request, res: Response) => {
  try {
    const csv = await ProductService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
