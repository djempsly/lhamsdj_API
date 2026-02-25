import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

/**
 * Generic REST API adapter for dropshipping suppliers.
 * Configurable base URL and API key.
 * Adapt the response mapping per supplier's actual API format.
 */
export function createGenericApiAdapter(config: { name: string; baseUrl: string; apiKey: string }): SupplierAdapter {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  return {
    name: config.name,

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const res = await fetch(`${config.baseUrl}/products/${sku}`, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        return { sku: data.sku || sku, name: data.name || data.title, price: data.price, stock: data.stock ?? data.quantity ?? 0, imageUrl: data.image, description: data.description };
      } catch (err) {
        logger.error({ supplier: config.name, sku, err }, 'Failed to get supplier product');
        return null;
      }
    },

    async getStock(sku: string): Promise<number> {
      const product = await this.getProduct(sku);
      return product?.stock ?? -1;
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const res = await fetch(`${config.baseUrl}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ items: [{ sku: request.supplierSku, quantity: request.quantity }], shipping_address: request.shippingAddress }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Supplier order failed');
        return { externalOrderId: data.order_id || data.id, status: 'CONFIRMED', trackingNumber: data.tracking_number, estimatedDelivery: data.estimated_delivery };
      } catch (err: any) {
        logger.error({ supplier: config.name, err: err.message }, 'Failed to place supplier order');
        throw new Error(`Error placing order with ${config.name}: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string) {
      try {
        const res = await fetch(`${config.baseUrl}/orders/${externalOrderId}`, { headers });
        const data = await res.json();
        return { status: data.status || 'UNKNOWN', trackingNumber: data.tracking_number };
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
