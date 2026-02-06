import { prisma } from '../lib/prisma';

// Helper simple para crear slugs (puedes usar una librería como 'slugify' si prefieres)
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '') // Elimina caracteres no permitidos
    .replace(/\-\-+/g, '-');  // Reemplaza múltiples - con uno solo
};

export const CategoryService = {
  
  // Crear Categoría
  async create(data: any) {
    const slug = generateSlug(data.name || '');

    // Verificar si el slug ya existe
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`La categoría '${data.name}' ya existe (slug duplicado).`);
    }

    return await prisma.category.create({
      data: {
        ...data,
        slug // Guardamos el slug generado
      }
    });
  },

  // Obtener todas (Jerárquicas)
  async getAll() {
    return await prisma.category.findMany({
      where: { parentId: null }, // Obtenemos las padres primero
      include: {
        children: true, // Incluimos sus subcategorías inmediatas
        _count: { select: { products: true } } // Contamos cuántos productos tienen
      }
    });
  },

  // Obtener una por SLUG (Para la vista de productos)
  async getBySlug(slug: string) {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true
      }
    });
  },

  // Obtener una por ID (Para administración)
  async getById(id: number) {
    return await prisma.category.findUnique({
      where: { id }
    });
  },

  // Actualizar
  async update(id: number, data: any) {
    // Si cambia el nombre, podríamos regenerar el slug, 
    // pero por SEO a veces es mejor NO cambiar el slug. 
    // Aquí lo dejaremos opcional.
    
    return await prisma.category.update({
      where: { id },
      data
    });
  },

  // Eliminar
  async delete(id: number) {
    // Verificamos si tiene productos antes de borrar
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } }
    });

    if (!category) throw new Error("Categoría no encontrada");

    if (category._count.products > 0) {
      throw new Error("No se puede eliminar: La categoría tiene productos asociados.");
    }

    if (category._count.children > 0) {
      throw new Error("No se puede eliminar: La categoría tiene subcategorías.");
    }

    return await prisma.category.delete({
      where: { id }
    });
  }
};