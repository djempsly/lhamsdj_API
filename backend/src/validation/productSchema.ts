// import { z } from 'zod';

// export const createProductSchema = z.object({
//   name: z.string().min(3, "El nombre es muy corto"),
//   description: z.string().optional(),
//   price: z.number().min(0, "El precio no puede ser negativo"),
  
//   // SOLUCIÓN: Usamos la validación encadenada estándar.
//   // Es segura, profesional y no da errores de compilación.
//   categoryId: z.number().int().positive(), 
  
//   images: z.array(z.string().url()).optional() 
// });

// export const updateProductSchema = z.object({
//   name: z.string().optional(),
//   description: z.string().optional(),
//   price: z.number().min(0).optional(),
//   categoryId: z.number().int().positive().optional(),
//   isActive: z.boolean().optional(),
//   images: z.array(z.string().url()).optional()
// });





import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio no puede ser negativo"),
  stock: z.number().int().min(0).optional(), // <--- Nuevo campo (opcional, default 0)
  categoryId: z.number().int().positive(),
  images: z.array(z.string().url()).optional()
});

export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(), // <--- Nuevo campo
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string().url()).optional()
});