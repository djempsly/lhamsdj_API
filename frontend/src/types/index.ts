export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Prisma devuelve Decimal como string a veces, o number. Ajustaremos.
  slug: string;
  stock: number;
  categoryId: number;
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}