export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  localPrice?: number;
  localCurrency?: string;
  slug: string;
  stock: number;
  weight?: string;
  categoryId: number;
  vendorId?: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  category?: { name: string; slug: string };
  vendor?: { businessName: string; slug: string };
  _count?: { reviews: number };
}

export interface ProductImage {
  id: number;
  url: string;
}

export interface ProductVariant {
  id: number;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  price: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "VENDOR" | "SUPPORT";
  isVerified?: boolean;
  profileImage?: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: { id: number; name: string; price: string; images: ProductImage[] };
  productVariant?: ProductVariant;
}

export interface Order {
  id: number;
  total: string;
  subtotal?: string;
  shippingCost?: string;
  discount?: string;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
  address: Address;
  shipments?: Shipment[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product: { name: string; images?: ProductImage[] };
  productVariant?: ProductVariant;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Shipment {
  id: number;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: string;
  estimatedDelivery?: string;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: { min: number; max: number };
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface WishlistItem {
  id: number;
  productId: number;
  product: Product;
  createdAt: string;
}
