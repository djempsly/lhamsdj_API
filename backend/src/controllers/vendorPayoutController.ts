import { Request, Response } from 'express';
import { VendorPayoutService } from '../services/vendorPayoutService';

export const createConnectAccount = async (req: Request, res: Response) => {
  try {
    const result = await VendorPayoutService.createConnectAccount(req.user?.id!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyPayouts = async (req: Request, res: Response) => {
  try {
    const payouts = await VendorPayoutService.getVendorPayouts(req.user?.id!);
    res.json({ success: true, data: payouts });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const processPayouts = async (req: Request, res: Response) => {
  try {
    const count = await VendorPayoutService.processPendingPayouts();
    res.json({ success: true, message: `${count} payouts procesados` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
