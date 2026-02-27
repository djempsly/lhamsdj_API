import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { TaxService } from '../services/taxService';
import { LegalService } from '../services/legalService';

export const getSalesAnalytics = async (req: Request, res: Response) => {
  try { const data = await AnalyticsService.getSalesAnalytics(req.query.period as string); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const getProductAnalytics = async (req: Request, res: Response) => {
  try { const data = await AnalyticsService.getProductAnalytics(Number(req.query.limit) || 20); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const getUserAnalytics = async (req: Request, res: Response) => {
  try { const data = await AnalyticsService.getUserAnalytics(); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const getVendorAnalytics = async (req: Request, res: Response) => {
  try { const data = await AnalyticsService.getVendorAnalytics(Number(req.params.vendorId)); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const data = await AnalyticsService.exportSalesReport(req.query.period as string || '30d', req.query.format as string || 'json');
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
      return res.send(data);
    }
    res.json({ success: true, data });
  } catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

// Tax
export const calculateTax = async (req: Request, res: Response) => {
  try { const data = await TaxService.calculateTax(req.body.country, req.body.state ?? null, req.body.subtotal); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

export const getTaxRules = async (_req: Request, res: Response) => {
  try { const data = await TaxService.getRules(); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const createTaxRule = async (req: Request, res: Response) => {
  try { const data = await TaxService.createRule(req.body); res.status(201).json({ success: true, data }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

export const updateTaxRule = async (req: Request, res: Response) => {
  try { const data = await TaxService.updateRule(Number(req.params.id), req.body); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

export const deleteTaxRule = async (req: Request, res: Response) => {
  try { await TaxService.deleteRule(Number(req.params.id)); res.json({ success: true }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

// Legal
export const getLegalDocument = async (req: Request, res: Response) => {
  try { const slug = typeof req.params.slug === 'string' ? req.params.slug : ''; const data = await LegalService.getDocument(slug); if (!data) return res.status(404).json({ success: false }); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const getAllLegalDocs = async (_req: Request, res: Response) => {
  try { const data = await LegalService.getAll(); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const upsertLegalDoc = async (req: Request, res: Response) => {
  try { const data = await LegalService.upsert(req.body); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

export const recordCookieConsent = async (req: Request, res: Response) => {
  try { await LegalService.recordConsent({ ...req.body, userId: req.user?.id, ip: req.ip }); res.json({ success: true }); }
  catch (e: unknown) { res.status(400).json({ success: false, message: (e as Error).message }); }
};

export const exportMyData = async (req: Request, res: Response) => {
  try { const data = await LegalService.exportUserData(req.user!.id); res.json({ success: true, data }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};

export const deleteMyData = async (req: Request, res: Response) => {
  try { await LegalService.deleteUserData(req.user!.id); res.json({ success: true, message: 'Data deleted' }); }
  catch (e: unknown) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
