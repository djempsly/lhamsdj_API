import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

const PRINTFUL_API = 'https://api.printful.com';

export function createPrintfulAdapter(config: { apiKey: string }): SupplierAdapter {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  return {
    name: 'PRINTFUL',

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const res = await fetch(`${PRINTFUL_API}/store/products/@${sku}`, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        const p = data.result;
        return {
          sku: String(p.id),
          name: p.name,
          price: p.sync_variants?.[0]?.retail_price ?? 0,
          stock: 999, // Printful is print-on-demand, stock is unlimited
          imageUrl: p.thumbnail_url,
          description: '',
        };
      } catch (err) {
        logger.error({ sku, err }, 'Printful: getProduct failed');
        return null;
      }
    },

    async getStock(_sku: string): Promise<number> {
      return 999; // Print-on-demand
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const res = await fetch(`${PRINTFUL_API}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipient: {
              name: request.shippingAddress.name,
              address1: request.shippingAddress.street,
              city: request.shippingAddress.city,
              state_code: request.shippingAddress.state || '',
              country_code: request.shippingAddress.country,
              zip: request.shippingAddress.postalCode,
              phone: request.shippingAddress.phone || '',
            },
            items: [{ sync_variant_id: Number(request.supplierSku), quantity: request.quantity }],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.result || data.error?.message || 'Printful order failed');

        return {
          externalOrderId: String(data.result.id),
          status: 'CONFIRMED',
        };
      } catch (err: any) {
        logger.error({ err: err.message }, 'Printful: placeOrder failed');
        throw new Error(`Printful: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string) {
      try {
        const res = await fetch(`${PRINTFUL_API}/orders/@${externalOrderId}`, { headers });
        const data = await res.json();
        if (!res.ok) return { status: 'UNKNOWN' };

        const statusMap: Record<string, string> = {
          draft: 'pending', pending: 'pending', failed: 'failed',
          canceled: 'cancelled', inprocess: 'confirmed',
          onhold: 'confirmed', partial: 'shipped',
          fulfilled: 'shipped',
        };

        const shipments = data.result.shipments || [];
        const tracking = shipments[0]?.tracking_number;

        return {
          status: statusMap[data.result.status] || 'confirmed',
          trackingNumber: tracking || undefined,
        };
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
