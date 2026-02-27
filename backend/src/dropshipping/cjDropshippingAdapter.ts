import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

const CJ_API = 'https://developers.cjdropshipping.com/api2.0/v1';

export function createCJDropshippingAdapter(config: { apiKey: string }): SupplierAdapter {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'CJ-Access-Token': config.apiKey,
  };

  return {
    name: 'CJ_DROPSHIPPING',

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const res = await fetch(`${CJ_API}/product/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ pid: sku }),
        });
        const data = await res.json();
        if (!data.result || !data.data) return null;

        const p = data.data;
        return {
          sku: p.pid || sku,
          name: p.productNameEn || p.productName,
          price: p.sellPrice || 0,
          stock: p.productStock ?? 0,
          imageUrl: p.productImage,
          description: p.description,
        };
      } catch (err) {
        logger.error({ sku, err }, 'CJ: getProduct failed');
        return null;
      }
    },

    async getStock(sku: string): Promise<number> {
      const product = await this.getProduct(sku);
      return product?.stock ?? -1;
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const res = await fetch(`${CJ_API}/shopping/order/createOrder`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            orderNumber: `LDJ-${Date.now()}`,
            shippingZip: request.shippingAddress.postalCode,
            shippingCountryCode: request.shippingAddress.country,
            shippingProvince: request.shippingAddress.state || '',
            shippingCity: request.shippingAddress.city,
            shippingAddress: request.shippingAddress.street,
            shippingCustomerName: request.shippingAddress.name,
            shippingPhone: request.shippingAddress.phone || '',
            products: [{ vid: request.supplierSku, quantity: request.quantity }],
          }),
        });
        const data = await res.json();
        if (!data.result) throw new Error(data.message || 'CJ order creation failed');

        return {
          externalOrderId: data.data?.orderId || data.data?.orderNum || `CJ-${Date.now()}`,
          status: 'CONFIRMED',
        };
      } catch (err: any) {
        logger.error({ err: err.message }, 'CJ: placeOrder failed');
        throw new Error(`CJ Dropshipping: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string) {
      try {
        const res = await fetch(`${CJ_API}/shopping/order/getOrderDetail?orderId=${externalOrderId}`, { headers });
        const data = await res.json();
        if (!data.result) return { status: 'UNKNOWN' };

        const order = data.data;
        const statusMap: Record<string, string> = {
          CREATED: 'pending', IN_CART: 'pending', UNPAID: 'pending',
          UNSHIPPED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered',
          CANCELLED: 'cancelled',
        };

        return {
          status: statusMap[order.orderStatus] || 'confirmed',
          trackingNumber: order.trackingNumber || undefined,
        };
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
