import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { audit, AuditActions } from '../lib/audit';
import { submitKycSchema, adminReviewKycSchema, KYC_DOCUMENT_TYPES } from '../validation/kycSchema';

export const getMyKyc = async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { userId: req.user!.id },
      select: {
        kycStatus: true,
        documentType: true,
        documentUrl: true,
        documentVerifiedAt: true,
        businessAddressVerifiedAt: true,
        bankAccountVerifiedAt: true,
      },
    });
    if (!vendor) return res.status(404).json({ success: false, message: 'No tienes cuenta de vendedor' });
    res.json({
      success: true,
      data: { ...vendor, documentUrl: vendor.documentUrl ? '[submitted]' : null },
      allowedDocumentTypes: [...KYC_DOCUMENT_TYPES],
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor) return res.status(404).json({ success: false, message: 'No tienes cuenta de vendedor' });
    if (vendor.kycStatus === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'KYC ya aprobado' });
    }
    const parsed = submitKycSchema.parse(req.body);
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        documentType: parsed.documentType,
        documentUrl: parsed.documentUrl,
        kycStatus: 'PENDING',
        documentVerifiedAt: null,
        businessAddressVerifiedAt: null,
        bankAccountVerifiedAt: null,
      },
    });
    await audit({ userId: req.user!.id, action: 'KYC_SUBMITTED', entity: 'Vendor', entityId: vendor.id, ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ success: true, message: 'KYC enviado a revisión. Documento e identidad serán verificados.' });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ success: false, message: e.errors?.[0]?.message ?? 'Validación fallida' });
    }
    res.status(400).json({ success: false, message: e.message });
  }
};

export const adminReviewKyc = async (req: Request, res: Response) => {
  try {
    const vendorId = Number(req.params.vendorId);
    const parsed = adminReviewKycSchema.parse(req.body);
    const { status, notes } = parsed;
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
      data: { vendorId, reviewedBy: req.user!.id, status, notes: notes ?? null },
    });
    await audit({
      userId: req.user!.id,
      action: AuditActions.ADMIN_VENDOR_STATUS_CHANGED,
      entity: 'Vendor',
      entityId: vendorId,
      details: `KYC ${status}${notes ? ': ' + notes : ''}`,
      ip: req.ip,
    });
    res.json({ success: true, data: vendor });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ success: false, message: e.errors?.[0]?.message ?? 'Validación fallida' });
    }
    res.status(500).json({ success: false, message: e.message });
  }
};
