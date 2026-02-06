import { prisma } from '../lib/prisma';

// Helper para slug (mismo que en categorías)
const generateSlug = (text: string) => {
  return text
    .toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Date.now().toString().slice(-4); 
    // Agregamos números al final para evitar duplicados en productos similares
};

export const ProductService = {
  
  // Crear Producto
  async create(data: any) {
    const { images, ...productData } = data;
    const slug = generateSlug(productData.name);

    // Verificar si la categoría existe
    const categoryExists = await prisma.category.findUnique({ where: { id: productData.categoryId } });
    if (!categoryExists) throw new Error("La categoría especificada no existe");

    // Crear producto + Imágenes (Transacción implícita de Prisma)
    return await prisma.product.create({
      data: {
        ...productData,
        slug,
        // Si vienen imágenes, las creamos en la tabla relacionada
        images: images && images.length > 0 ? {
          create: images.map((url: string) => ({ url }))
        } : undefined
      },
      include: {
        category: true, // Devolvemos la info de la categoría
        images: true    // Devolvemos las imágenes creadas
      }
    });
  },

  // Obtener todos (Paginación básica opcional)
  async getAll() {
    return await prisma.product.findMany({
      where: { isActive: true }, // Por defecto solo mostramos activos al público
      include: {
        category: { select: { name: true, slug: true } },
        images: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Obtener por Slug (Para detalle de producto)
  async getBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: true
      }
    });
  },

  // Obtener por ID (Admin)
  async getById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true }
    });
  },

  // Actualizar
  async update(id: number, data: any) {
    const { images, ...updateData } = data;
    
    // Si hay imágenes nuevas, las agregamos (no borramos las viejas aquí)
    const queryData: any = { ...updateData };

    if (images && images.length > 0) {
      queryData.images = {
        create: images.map((url: string) => ({ url }))
      };
    }

    return await prisma.product.update({
      where: { id },
      data: queryData,
      include: { images: true }
    });
  },

  // Eliminar (Soft Delete recomendado, pero aquí hacemos Delete real si no hay ventas)
  async delete(id: number) {
    // Nota: Si tiene órdenes, Prisma lanzará error.
    // Podrías cambiar esto a Soft Delete (isActive: false) como en usuarios.
    return await prisma.product.delete({
      where: { id }
    });
  }
};