import { CarrierAdapter, ShippingAddress, ShippingPackage, ShippingRate, TrackingInfo } from './types';

interface ZoneConfig {
  zone: string;
  baseRate: number;
  perKg: number;
  estimatedDays: { min: number; max: number };
}

const ZONE_MAP: Record<string, string> = {
  US: 'DOMESTIC', CA: 'NORTH_AMERICA',
  MX: 'LATAM', DO: 'CARIBBEAN', PR: 'CARIBBEAN', CO: 'LATAM', BR: 'LATAM', AR: 'LATAM', CL: 'LATAM', PE: 'LATAM',
  GB: 'EUROPE', DE: 'EUROPE', FR: 'EUROPE', ES: 'EUROPE', IT: 'EUROPE', NL: 'EUROPE', PT: 'EUROPE',
  CN: 'ASIA', JP: 'ASIA', KR: 'ASIA', IN: 'ASIA', TH: 'ASIA', VN: 'ASIA',
  AU: 'OCEANIA', NZ: 'OCEANIA',
  NG: 'AFRICA', ZA: 'AFRICA', KE: 'AFRICA',
};

const ZONE_RATES: Record<string, ZoneConfig> = {
  DOMESTIC:       { zone: 'DOMESTIC',       baseRate: 5.99,  perKg: 1.50, estimatedDays: { min: 2, max: 5 } },
  NORTH_AMERICA:  { zone: 'NORTH_AMERICA',  baseRate: 9.99,  perKg: 2.50, estimatedDays: { min: 5, max: 10 } },
  CARIBBEAN:      { zone: 'CARIBBEAN',      baseRate: 12.99, perKg: 3.00, estimatedDays: { min: 5, max: 12 } },
  LATAM:          { zone: 'LATAM',          baseRate: 14.99, perKg: 3.50, estimatedDays: { min: 7, max: 15 } },
  EUROPE:         { zone: 'EUROPE',         baseRate: 18.99, perKg: 4.00, estimatedDays: { min: 7, max: 14 } },
  ASIA:           { zone: 'ASIA',           baseRate: 22.99, perKg: 5.00, estimatedDays: { min: 10, max: 20 } },
  OCEANIA:        { zone: 'OCEANIA',        baseRate: 24.99, perKg: 5.50, estimatedDays: { min: 10, max: 21 } },
  AFRICA:         { zone: 'AFRICA',         baseRate: 27.99, perKg: 6.00, estimatedDays: { min: 14, max: 28 } },
  INTERNATIONAL:  { zone: 'INTERNATIONAL',  baseRate: 29.99, perKg: 6.50, estimatedDays: { min: 14, max: 30 } },
};

function getZone(countryCode: string): string {
  return ZONE_MAP[countryCode.toUpperCase()] || 'INTERNATIONAL';
}

function calculateRate(zone: ZoneConfig, pkg: ShippingPackage): number {
  const weight = Math.max(pkg.weightKg, 0.5);
  return Math.round((zone.baseRate + zone.perKg * weight) * 100) / 100;
}

/**
 * Built-in zone-based shipping calculator.
 * Works without external APIs. Replace with EasyPost/ShipEngine adapter for real carrier rates.
 */
export const zoneCalculator: CarrierAdapter = {
  name: 'LhamsDJ Shipping',

  async getRates(from: ShippingAddress, to: ShippingAddress, pkg: ShippingPackage): Promise<ShippingRate[]> {
    const zone = getZone(to.country);
    const config = ZONE_RATES[zone] || ZONE_RATES['INTERNATIONAL'];
    const standardPrice = calculateRate(config!, pkg);

    const rates: ShippingRate[] = [
      {
        carrier: 'LhamsDJ Shipping',
        service: 'Standard',
        price: standardPrice,
        currency: 'USD',
        estimatedDays: config!.estimatedDays,
      },
      {
        carrier: 'LhamsDJ Shipping',
        service: 'Express',
        price: Math.round(standardPrice * 1.8 * 100) / 100,
        currency: 'USD',
        estimatedDays: { min: Math.max(1, config!.estimatedDays.min - 2), max: Math.ceil(config!.estimatedDays.max * 0.6) },
      },
    ];

    if (zone === 'DOMESTIC' || zone === 'NORTH_AMERICA') {
      rates.push({
        carrier: 'LhamsDJ Shipping',
        service: 'Economy',
        price: Math.round(standardPrice * 0.7 * 100) / 100,
        currency: 'USD',
        estimatedDays: { min: config!.estimatedDays.min + 3, max: config!.estimatedDays.max + 5 },
      });
    }

    return rates.sort((a, b) => a.price - b.price);
  },

  async getTracking(_trackingNumber: string): Promise<TrackingInfo | null> {
    return null;
  },
};

export { getZone, ZONE_RATES };
