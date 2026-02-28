import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

const HYPERSKU_API = 'https://api.hypersku.com/v1';

export function createHyperSKUAdapter(config: { apiKey: string }): SupplierAdapter {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  return {
    name: 'HYPERSKU',

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const res = await fetch(`${HYPERSKU_API}/products/${sku}`, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        const p = data.data || data;
        return {
          sku: p.sku || p.id || sku,
          name: p.title || p.name,
          price: p.cost || p.price || 0,
          stock: p.inventory ?? p.stock ?? 0,
          imageUrl: p.image || p.images?.[0],
          description: p.description,
        };
      } catch (err) {
        logger.error({ sku, err }, 'HyperSKU: getProduct failed');
        return null;
      }
    },

    async getStock(sku: string): Promise<number> {
      const product = await this.getProduct(sku);
      return product?.stock ?? -1;
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const res = await fetch(`${HYPERSKU_API}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            line_items: [{ sku: request.supplierSku, quantity: request.quantity }],
            shipping_address: {
              name: request.shippingAddress.name,
              address1: request.shippingAddress.street,
              city: request.shippingAddress.city,
              province: request.shippingAddress.state || '',
              country_code: request.shippingAddress.country,
              zip: request.shippingAddress.postalCode,
              phone: request.shippingAddress.phone || '',
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'HyperSKU order failed');

        return {
          externalOrderId: data.data?.order_id || data.order_id || `HSKU-${Date.now()}`,
          status: 'CONFIRMED',
          trackingNumber: data.data?.tracking_number,
        };
      } catch (err: any) {
        logger.error({ err: err.message }, 'HyperSKU: placeOrder failed');
        throw new Error(`HyperSKU: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string) {
      try {
        const res = await fetch(`${HYPERSKU_API}/orders/${externalOrderId}`, { headers });
        const data = await res.json();
        if (!res.ok) return { status: 'UNKNOWN' };

        const p = data.data || data;
        return {
          status: p.fulfillment_status || p.status || 'UNKNOWN',
          trackingNumber: p.tracking_number || p.tracking_numbers?.[0],
        };
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
