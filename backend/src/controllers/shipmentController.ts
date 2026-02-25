import { Request, Response } from 'express';
import { ShipmentService } from '../services/shipmentService';
import { parsePagination } from '../utils/pagination';
import { z } from 'zod';

const updateTrackingSchema = z.object({
  carrier: z.string().min(1),
  trackingNumber: z.string().min(1),
  trackingUrl: z.string().url().optional(),
  estimatedDelivery: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'FAILED']),
  location: z.string().optional(),
  details: z.string().optional(),
});

export const getOrderShipments = async (req: Request, res: Response) => {
  try {
    const shipments = await ShipmentService.getByOrder(Number(req.params.orderId));
    res.json({ success: true, data: shipments });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTracking = async (req: Request, res: Response) => {
  try {
    const data = updateTrackingSchema.parse(req.body);
    const shipment = await ShipmentService.updateTracking(Number(req.params.id), req.user?.id!, data);
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { status, location, details } = updateStatusSchema.parse(req.body);
    const shipment = await ShipmentService.updateStatus(Number(req.params.id), status, location, details);
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVendorShipments = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any);
    const result = await ShipmentService.getVendorShipments(req.user?.id!, pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
