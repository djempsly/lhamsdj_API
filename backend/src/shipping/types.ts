export interface ShippingAddress {
  country: string;
  state?: string | undefined;
  city: string;
  postalCode: string;
}

export interface ShippingPackage {
  weightKg: number;
  items: number;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: { min: number; max: number };
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  events: { status: string; location?: string; timestamp: string; details?: string }[];
}

export interface CarrierAdapter {
  name: string;
  getRates(from: ShippingAddress, to: ShippingAddress, pkg: ShippingPackage): Promise<ShippingRate[]>;
  getTracking(trackingNumber: string): Promise<TrackingInfo | null>;
}
