import { prisma } from '../lib/prisma';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

const generateSlug = (text: string) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
    + '-' + Date.now().toString().slice(-4);
};

export const SupplierService = {
  async create(data: { name: string; apiType?: string; apiBaseUrl?: string; apiKey?: string; apiConfig?: any; webhookSecret?: string; contactEmail?: string; country: string; currency?: string; leadTimeDays?: number; notes?: string }) {
    const slug = generateSlug(data.name);
    return await prisma.supplier.create({
      data: {
        name: data.name,
        slug,
        apiType: data.apiType || 'MANUAL',
        apiBaseUrl: data.apiBaseUrl ?? null,
        apiKey: data.apiKey ?? null,
        apiConfig: data.apiConfig ?? undefined,
        webhookSecret: data.webhookSecret ?? null,
        contactEmail: data.contactEmail ?? null,
        country: data.country,
        currency: data.currency || 'USD',
        leadTimeDays: data.leadTimeDays || 7,
        notes: data.notes ?? null,
      },
    });
  },

  async getAll(pagination: PaginationResult) {
    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        include: { _count: { select: { products: true, orders: true } } },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.supplier.count(),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async getById(id: number) {
    return await prisma.supplier.findUnique({
      where: { id },
      include: { products: { include: { product: { select: { name: true, price: true, stock: true } } } }, _count: { select: { orders: true } } },
    });
  },

  async update(id: number, data: any) {
    return await prisma.supplier.update({ where: { id }, data });
  },

  async linkProduct(supplierId: number, data: { productId: number; supplierSku: string; supplierPrice: number; supplierUrl?: string | undefined }) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new Error('Proveedor no encontrado');

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Producto no encontrado');

    return await prisma.supplierProduct.create({
      data: {
        supplierId,
        productId: data.productId,
        supplierSku: data.supplierSku,
        supplierPrice: data.supplierPrice,
        supplierUrl: data.supplierUrl ?? null,
      },
    });
  },

  async unlinkProduct(supplierId: number, productId: number) {
    await prisma.supplierProduct.delete({
      where: { supplierId_productId: { supplierId, productId } },
    });
  },

  async importProducts(supplierId: number, products: { name: string; description?: string | undefined; price: number; supplierSku: string; supplierPrice: number; categoryId: number; imageUrl?: string | undefined }[]) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new Error('Proveedor no encontrado');

    let imported = 0;
    for (const p of products) {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now().toString().slice(-4) + imported;

      const productData: any = {
        name: p.name, description: p.description ?? null, price: p.price,
        slug, categoryId: p.categoryId, stock: 0, isActive: true,
      };
      if (p.imageUrl) productData.images = { create: { url: p.imageUrl } };

      const product = await prisma.product.create({ data: productData });

      await prisma.supplierProduct.create({
        data: { supplierId, productId: product.id, supplierSku: p.supplierSku, supplierPrice: p.supplierPrice },
      });

      imported++;
    }

    return imported;
  },

  async getSupplierOrders(supplierId: number, pagination: PaginationResult) {
    const where = { supplierId };
    const [data, total] = await Promise.all([
      prisma.supplierOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.supplierOrder.count({ where }),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },
};
