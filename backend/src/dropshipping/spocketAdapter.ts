import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

const SPOCKET_API = 'https://app.spocket.co/api/v1';

export function createSpocketAdapter(config: { apiKey: string }): SupplierAdapter {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  return {
    name: 'SPOCKET',

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const res = await fetch(`${SPOCKET_API}/products/${sku}`, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        const p = data.product || data.data || data;
        return {
          sku: p.sku || p.id || sku,
          name: p.title || p.name,
          price: p.cost || p.price || 0,
          stock: p.inventory_quantity ?? p.stock ?? 0,
          imageUrl: p.image?.src || p.images?.[0]?.src,
          description: p.description || p.body_html,
        };
      } catch (err) {
        logger.error({ sku, err }, 'Spocket: getProduct failed');
        return null;
      }
    },

    async getStock(sku: string): Promise<number> {
      const product = await this.getProduct(sku);
      return product?.stock ?? -1;
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const res = await fetch(`${SPOCKET_API}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            line_items: [{ sku: request.supplierSku, quantity: request.quantity }],
            shipping_address: {
              first_name: request.shippingAddress.name.split(' ')[0],
              last_name: request.shippingAddress.name.split(' ').slice(1).join(' ') || '-',
              address1: request.shippingAddress.street,
              city: request.shippingAddress.city,
              province: request.shippingAddress.state || '',
              country: request.shippingAddress.country,
              zip: request.shippingAddress.postalCode,
              phone: request.shippingAddress.phone || '',
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Spocket order failed');

        return {
          externalOrderId: data.order?.id || data.id || `SPK-${Date.now()}`,
          status: 'CONFIRMED',
          trackingNumber: data.order?.tracking_number,
        };
      } catch (err: any) {
        logger.error({ err: err.message }, 'Spocket: placeOrder failed');
        throw new Error(`Spocket: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string) {
      try {
        const res = await fetch(`${SPOCKET_API}/orders/${externalOrderId}`, { headers });
        const data = await res.json();
        if (!res.ok) return { status: 'UNKNOWN' };

        const order = data.order || data.data || data;
        return {
          status: order.fulfillment_status || order.status || 'UNKNOWN',
          trackingNumber: order.tracking_number || order.tracking_numbers?.[0],
        };
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
