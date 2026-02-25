import { CarrierAdapter, ShippingAddress, ShippingPackage, ShippingRate } from './types';
import { zoneCalculator } from './zoneCalculator';

/**
 * Manages multiple carrier adapters.
 * Start with zone calculator; add EasyPost, ShipEngine, etc. as adapters.
 */
class ShippingManager {
  private adapters: CarrierAdapter[] = [];

  register(adapter: CarrierAdapter) {
    this.adapters.push(adapter);
  }

  async getRates(from: ShippingAddress, to: ShippingAddress, pkg: ShippingPackage): Promise<ShippingRate[]> {
    const allRates: ShippingRate[] = [];

    const results = await Promise.allSettled(
      this.adapters.map((adapter) => adapter.getRates(from, to, pkg))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allRates.push(...result.value);
      }
    }

    return allRates.sort((a, b) => a.price - b.price);
  }

  async getTracking(trackingNumber: string) {
    for (const adapter of this.adapters) {
      const info = await adapter.getTracking(trackingNumber);
      if (info) return info;
    }
    return null;
  }
}

const shippingManager = new ShippingManager();
shippingManager.register(zoneCalculator);

export default shippingManager;
