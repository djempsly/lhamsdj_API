import { Request, Response } from 'express';
import { SupplierService } from '../services/supplierService';
import { DropshipService } from '../services/dropshipService';
import { SUPPORTED_ADAPTER_TYPES, registerFromConfig, registerCustomAdapter } from '../dropshipping/adapterRegistry';
import { parsePagination } from '../utils/pagination';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2).max(100),
  apiType: z.string().max(50).optional(),
  apiBaseUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  apiKey: z.string().max(500).optional(),
  apiConfig: z.any().optional(),
  webhookSecret: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  country: z.string().min(2).max(100),
  currency: z.string().length(3).optional(),
  leadTimeDays: z.number().int().min(1).max(90).optional(),
  notes: z.string().max(2000).optional(),
});

const linkSchema = z.object({
  productId: z.number().int().positive(),
  supplierSku: z.string().min(1).max(100),
  supplierPrice: z.number().positive(),
  supplierUrl: z.string().url().optional(),
});

const importSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    supplierSku: z.string().min(1),
    supplierPrice: z.number().positive(),
    categoryId: z.number().int().positive(),
    imageUrl: z.string().url().optional(),
  })).min(1).max(100),
});

export const getAdapterTypes = async (_req: Request, res: Response) => {
  res.json({ success: true, data: SUPPORTED_ADAPTER_TYPES });
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.parse(req.body);
    const supplier = await SupplierService.create(parsed as any);

    if (supplier.apiType === 'CUSTOM_API' && supplier.apiBaseUrl && supplier.apiKey && (supplier as any).apiConfig) {
      registerCustomAdapter(supplier.id, supplier.name, supplier.apiBaseUrl, supplier.apiKey, (supplier as any).apiConfig);
    } else if (supplier.apiType !== 'MANUAL' && supplier.apiKey) {
      registerFromConfig(supplier.apiType, supplier.apiBaseUrl || '', supplier.apiKey);
    }

    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any);
    const result = await SupplierService.getAll(pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.getById(Number(req.params.id));
    if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.update(Number(req.params.id), req.body);

    if (supplier.apiType === 'CUSTOM_API' && supplier.apiBaseUrl && supplier.apiKey && (supplier as any).apiConfig) {
      registerCustomAdapter(supplier.id, supplier.name, supplier.apiBaseUrl, supplier.apiKey, (supplier as any).apiConfig);
    } else if (supplier.apiType !== 'MANUAL' && supplier.apiKey) {
      registerFromConfig(supplier.apiType, supplier.apiBaseUrl || '', supplier.apiKey);
    }

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const linkProduct = async (req: Request, res: Response) => {
  try {
    const data = linkSchema.parse(req.body);
    const link = await SupplierService.linkProduct(Number(req.params.id), data);
    res.status(201).json({ success: true, data: link });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const unlinkProduct = async (req: Request, res: Response) => {
  try {
    await SupplierService.unlinkProduct(Number(req.params.id), Number(req.params.productId));
    res.json({ success: true, message: 'Producto desvinculado' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importProducts = async (req: Request, res: Response) => {
  try {
    const { products } = importSchema.parse(req.body);
    const count = await SupplierService.importProducts(Number(req.params.id), products);
    res.json({ success: true, message: `${count} productos importados` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const fulfillOrder = async (req: Request, res: Response) => {
  try {
    const forwarded = await DropshipService.fulfillOrder(Number(req.params.orderId));
    res.json({ success: true, message: `${forwarded} items enviados a proveedores` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSupplierOrders = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any);
    const result = await SupplierService.getSupplierOrders(Number(req.params.id), pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testConnection = async (req: Request, res: Response) => {
  try {
    const supplier = await SupplierService.getById(Number(req.params.id));
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    if (!supplier.apiBaseUrl && supplier.apiType !== 'CJ_DROPSHIPPING' && supplier.apiType !== 'PRINTFUL' && supplier.apiType !== 'HYPERSKU' && supplier.apiType !== 'SPOCKET') {
      return res.status(400).json({ success: false, message: 'No API URL configured' });
    }

    const { getAdapter } = await import('../dropshipping/adapterRegistry');
    const adapterKey = supplier.apiType === 'CUSTOM_API' ? `CUSTOM_${supplier.id}` : supplier.apiType;
    const adapter = getAdapter(adapterKey);

    const start = Date.now();
    const product = await adapter.getProduct('test');
    const latency = Date.now() - start;

    res.json({ success: true, data: { connected: true, latencyMs: latency, adapterName: adapter.name } });
  } catch (error: any) {
    res.json({ success: true, data: { connected: false, error: error.message } });
  }
};
