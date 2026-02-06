// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 1. Declaramos que existe una variable 'prisma' en el objeto global de Node
declare global {
  var prisma: PrismaClient | undefined;
}

// 2. Exportamos la instancia: si ya existe en global la usamos, si no, creamos una nueva
 export const prisma = global.prisma || new PrismaClient({
  log: ['query'], // Logs en consola para ver las consultas SQL
});

// 3. Si no estamos en producción, guardamos la instancia en global
// Esto evita el error "Too many connections" al guardar cambios en desarrollo
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

//export default prisma