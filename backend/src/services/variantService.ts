// import { prisma } from '../lib/prisma';

// export const VariantService = {
//   async create(data: any) {
//     // Validar SKU único
//     const existing = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
//     if (existing) throw new Error("SKU ya existe");
    
//     return await prisma.productVariant.create({ data });
//   },

//   async delete(id: number) {
//     return await prisma.productVariant.delete({ where: { id } });
//   }
// };






import { prisma } from '../lib/prisma';

export const VariantService = {
  // Crear nueva variante
  async create(data: any) {
    // Verificar si el SKU ya existe
    const existing = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
    if (existing) throw new Error("Ya existe una variante con este SKU");

    // Verificar si el producto padre existe
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error("Producto no encontrado");

    return await prisma.productVariant.create({ data });
  },

  // Actualizar variante (Stock, Precio...)
  async update(id: number, data: any) {
    return await prisma.productVariant.update({
      where: { id },
      data
    });
  },

  // Borrar variante
  async delete(id: number) {
    return await prisma.productVariant.delete({ where: { id } });
  }
};