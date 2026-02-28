import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';
import logger from '../lib/logger';

/**
 * Configuration schema for a fully customizable API adapter.
 * Admins configure this from the UI; it's stored as JSON in Supplier.apiConfig.
 */
export interface CustomApiConfig {
  authType: 'bearer' | 'header' | 'query';
  authHeaderName?: string;   // e.g. "X-Api-Key", "Authorization"
  authPrefix?: string;       // e.g. "Bearer", "Token", "" (none)
  authQueryParam?: string;   // e.g. "api_key" (for authType=query)

  customHeaders?: Record<string, string>;

  endpoints: {
    getProduct: {
      method: string;   // GET, POST
      path: string;     // e.g. "/products/{sku}" or "/item/detail"
      bodyTemplate?: Record<string, unknown>;
    };
    placeOrder: {
      method: string;
      path: string;
      bodyTemplate?: Record<string, unknown>;
    };
    getOrderStatus: {
      method: string;
      path: string;
    };
  };

  responseMapping: {
    product: {
      sku: string;       // JSON path e.g. "data.sku"
      name: string;
      price: string;
      stock: string;
      image?: string;
    };
    order: {
      orderId: string;
      status?: string;
      tracking?: string;
    };
    orderStatus: {
      status: string;
      tracking?: string;
    };
  };
}

function resolveJsonPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function buildBody(
  template: Record<string, unknown> | undefined,
  vars: Record<string, string>,
): string | undefined {
  if (!template) return undefined;
  let json = JSON.stringify(template);
  json = json.replace(/"\{(\w+)\}"/g, (_, key) => {
    const val = vars[key];
    if (val === undefined) return '""';
    if (!isNaN(Number(val))) return val;
    return `"${val}"`;
  });
  return json;
}

export function createCustomApiAdapter(
  name: string,
  baseUrl: string,
  apiKey: string,
  config: CustomApiConfig,
): SupplierAdapter {
  function buildHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };

    if (config.authType === 'bearer') {
      h['Authorization'] = `${config.authPrefix || 'Bearer'} ${apiKey}`;
    } else if (config.authType === 'header') {
      h[config.authHeaderName || 'X-Api-Key'] = apiKey;
    }

    if (config.customHeaders) {
      Object.assign(h, config.customHeaders);
    }

    return h;
  }

  function buildUrl(pathTemplate: string, vars: Record<string, string>): string {
    let url = `${baseUrl}${interpolate(pathTemplate, vars)}`;
    if (config.authType === 'query') {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}${config.authQueryParam || 'api_key'}=${apiKey}`;
    }
    return url;
  }

  const headers = buildHeaders();

  return {
    name,

    async getProduct(sku: string): Promise<SupplierProductInfo | null> {
      try {
        const ep = config.endpoints.getProduct;
        const url = buildUrl(ep.path, { sku });
        const opts: RequestInit = { method: ep.method || 'GET', headers };

        if (ep.method === 'POST' && ep.bodyTemplate) {
          opts.body = buildBody(ep.bodyTemplate, { sku }) || null;
        }

        const res = await fetch(url, opts);
        if (!res.ok) return null;
        const data = await res.json();
        const m = config.responseMapping.product;

        const info: SupplierProductInfo = {
          sku: String(resolveJsonPath(data, m.sku) || sku),
          name: String(resolveJsonPath(data, m.name) || ''),
          price: Number(resolveJsonPath(data, m.price) || 0),
          stock: Number(resolveJsonPath(data, m.stock) ?? 0),
        };
        if (m.image) info.imageUrl = String(resolveJsonPath(data, m.image) || '');
        return info;
      } catch (err) {
        logger.error({ supplier: name, sku, err }, 'CustomAPI: getProduct failed');
        return null;
      }
    },

    async getStock(sku: string): Promise<number> {
      const product = await this.getProduct(sku);
      return product?.stock ?? -1;
    },

    async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
      try {
        const ep = config.endpoints.placeOrder;
        const vars: Record<string, string> = {
          sku: request.supplierSku,
          quantity: String(request.quantity),
          name: request.shippingAddress.name,
          street: request.shippingAddress.street,
          city: request.shippingAddress.city,
          state: request.shippingAddress.state || '',
          postalCode: request.shippingAddress.postalCode,
          country: request.shippingAddress.country,
          phone: request.shippingAddress.phone || '',
        };

        const url = buildUrl(ep.path, vars);
        let body: string | undefined;

        if (ep.bodyTemplate) {
          body = buildBody(ep.bodyTemplate, vars);
        } else {
          body = JSON.stringify({
            items: [{ sku: request.supplierSku, quantity: request.quantity }],
            shipping_address: request.shippingAddress,
          });
        }

        const res = await fetch(url, { method: ep.method || 'POST', headers, body: body || null });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Order failed');

        const m = config.responseMapping.order;
        const result: SupplierOrderResponse = {
          externalOrderId: String(resolveJsonPath(data, m.orderId) || `CUSTOM-${Date.now()}`),
          status: m.status ? String(resolveJsonPath(data, m.status) || 'CONFIRMED') : 'CONFIRMED',
        };
        if (m.tracking) {
          const t = resolveJsonPath(data, m.tracking);
          if (t) result.trackingNumber = String(t);
        }
        return result;
      } catch (err: any) {
        logger.error({ supplier: name, err: err.message }, 'CustomAPI: placeOrder failed');
        throw new Error(`${name}: ${err.message}`);
      }
    },

    async getOrderStatus(externalOrderId: string): Promise<{ status: string; trackingNumber?: string }> {
      try {
        const ep = config.endpoints.getOrderStatus;
        const url = buildUrl(ep.path, { orderId: externalOrderId });
        const res = await fetch(url, { method: ep.method || 'GET', headers });
        const data = await res.json();
        if (!res.ok) return { status: 'UNKNOWN' };

        const m = config.responseMapping.orderStatus;
        const out: { status: string; trackingNumber?: string } = {
          status: String(resolveJsonPath(data, m.status) || 'UNKNOWN'),
        };
        if (m.tracking) {
          const t = resolveJsonPath(data, m.tracking);
          if (t) out.trackingNumber = String(t);
        }
        return out;
      } catch {
        return { status: 'UNKNOWN' };
      }
    },
  };
}
