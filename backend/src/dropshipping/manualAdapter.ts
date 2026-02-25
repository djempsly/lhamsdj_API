import { SupplierAdapter, SupplierProductInfo, SupplierOrderRequest, SupplierOrderResponse } from './types';

/**
 * Manual adapter for suppliers without API.
 * Orders are created in the system and processed manually by the admin.
 * Used as fallback and for suppliers contacted via email/phone.
 */
export const manualAdapter: SupplierAdapter = {
  name: 'MANUAL',

  async getProduct(_sku: string): Promise<SupplierProductInfo | null> {
    return null;
  },

  async getStock(_sku: string): Promise<number> {
    return -1;
  },

  async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
    return {
      externalOrderId: `MANUAL-${Date.now()}`,
      status: 'PENDING',
    };
  },

  async getOrderStatus(_externalOrderId: string) {
    return { status: 'PENDING' };
  },
};
