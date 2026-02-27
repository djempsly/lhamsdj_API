import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { DropshipService } from '../services/dropshipService';
import { t } from '../i18n/t';
import logger from '../lib/logger';

export const supplierWebhook = async (req: Request, res: Response) => {
  try {
    const supplierId = Number(req.params.supplierId);
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    if (supplier.webhookSecret) {
      const signature = req.headers['x-webhook-signature'] as string
        || req.headers['x-signature'] as string
        || '';

      const expectedSig = crypto
        .createHmac('sha256', supplier.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (!signature || signature !== expectedSig) {
        logger.warn({ supplierId }, 'Supplier webhook: invalid signature');
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }
    }

    const { externalOrderId, order_id, status, trackingNumber, tracking_number, carrier } = req.body;

    const extId = externalOrderId || order_id;
    if (!extId) {
      return res.status(400).json({ success: false, message: 'externalOrderId is required' });
    }

    const result = await DropshipService.handleSupplierWebhook(supplierId, {
      externalOrderId: String(extId),
      status: status,
      trackingNumber: trackingNumber || tracking_number,
      carrier,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Order not found for this supplier' });
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    logger.error({ err: err.message }, 'Supplier webhook error');
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
