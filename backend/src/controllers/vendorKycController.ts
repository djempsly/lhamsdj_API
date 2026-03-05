import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { audit, AuditActions } from '../lib/audit';

export const getMyKyc = async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { userId: req.user!.id },
      select: {
        kycStatus: true,
        documentType: true,
        documentVerifiedAt: true,
        businessAddressVerifiedAt: true,
        bankAccountVerifiedAt: true,
      },
    });
    if (!vendor) return res.status(404).json({ success: false, message: 'No tienes cuenta de vendedor' });
    res.json({ success: true, data: vendor });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor) return res.status(404).json({ success: false, message: 'No tienes cuenta de vendedor' });
    const { documentType, documentUrl } = req.body;
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        documentType: documentType ?? undefined,
        documentUrl: documentUrl ?? undefined,
        kycStatus: 'PENDING',
      },
    });
    await audit({ userId: req.user!.id, action: 'KYC_SUBMITTED', entity: 'Vendor', entityId: vendor.id, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ success: true, message: 'KYC enviado a revisión' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const adminReviewKyc = async (req: Request, res: Response) => {
  try {
    const vendorId = Number(req.params.vendorId);
    const { status, notes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ success: false, message: 'status must be APPROVED or REJECTED' });
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        kycStatus: status,
        ...(status === 'APPROVED' && {
          documentVerifiedAt: new Date(),
          businessAddressVerifiedAt: new Date(),
          bankAccountVerifiedAt: new Date(),
        }),
      },
    });
    await prisma.vendorKycReview.create({
      data: { vendorId, reviewedBy: req.user!.id, status, notes },
    });
    await audit({ userId: req.user!.id, action: AuditActions.ADMIN_VENDOR_STATUS_CHANGED, entity: 'Vendor', entityId: vendorId, details: `KYC ${status}`, ip: req.ip });
    res.json({ success: true, data: vendor });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};
