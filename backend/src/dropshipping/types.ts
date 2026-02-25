export interface SupplierProductInfo {
  sku: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
}

export interface SupplierOrderRequest {
  supplierSku: string;
  quantity: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state?: string | undefined;
    postalCode: string;
    country: string;
    phone?: string | undefined;
  };
}

export interface SupplierOrderResponse {
  externalOrderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface SupplierAdapter {
  name: string;
  getProduct(sku: string): Promise<SupplierProductInfo | null>;
  getStock(sku: string): Promise<number>;
  placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse>;
  getOrderStatus(externalOrderId: string): Promise<{ status: string; trackingNumber?: string }>;
}
