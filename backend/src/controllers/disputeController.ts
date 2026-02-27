import { Request, Response } from 'express';
import { DisputeService } from '../services/disputeService';

export const createDispute = async (req: Request, res: Response) => {
  try {
    const { orderId, type, description } = req.body;
    if (!orderId || !type || !description)
      return res.status(400).json({ success: false, message: 'Missing fields' });
    const dispute = await DisputeService.create({
      orderId,
      userId: req.user!.id,
      type,
      description,
    });
    res.status(201).json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyDisputes = async (req: Request, res: Response) => {
  try {
    const disputes = await DisputeService.getMyDisputes(req.user!.id);
    res.json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDisputeById = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const userIdFilter = isAdmin ? undefined : req.user!.id;
    const dispute = await DisputeService.getById(Number(req.params.id), userIdFilter);
    if (!dispute) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDisputeMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });
    const msg = await DisputeService.addMessage(Number(req.params.id), req.user!.id, message);
    res.status(201).json({ success: true, data: msg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminGetDisputes = async (req: Request, res: Response) => {
  try {
    const result = await DisputeService.adminGetAll({
      status: req.query.status as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateDispute = async (req: Request, res: Response) => {
  try {
    const { status, resolution } = req.body;
    const dispute = await DisputeService.updateStatus(
      Number(req.params.id),
      status,
      resolution
    );
    res.json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
