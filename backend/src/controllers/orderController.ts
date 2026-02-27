import { Request, Response } from 'express';
import { t } from '../i18n/t';
import { OrderService } from '../services/orderService';
import { createOrderSchema } from '../validation/orderSchema';
import { adminUpdateOrderStatusSchema, adminExportQuerySchema } from '../validation/adminSchema';
import { parsePagination, PaginationQuery } from '../utils/pagination';
import { audit, AuditActions } from '../lib/audit';
import { z } from 'zod';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const data = createOrderSchema.parse(req.body);
    const order = await OrderService.createOrder(userId, data);
    res.status(201).json({ success: true, message: t(req.locale, 'order.created'), data: order });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Validation error' });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, message: msg });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const pagination = parsePagination(req.query as PaginationQuery, 'createdAt');
    const result = await OrderService.getMyOrders(userId, pagination);
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ success: false, message: t(req.locale, 'validation.invalidOrderId') });

    const order = await OrderService.getOrderById(userId, orderId);
    if (!order) return res.status(404).json({ success: false, message: t(req.locale, 'order.notFound') });
    res.json({ success: true, data: order });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
};

export const payOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ success: false, message: t(req.locale, 'validation.invalidOrderId') });

    const order = await OrderService.markAsPaid(userId, orderId);
    res.json({ success: true, message: t(req.locale, 'order.paymentRecorded'), data: order });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const status = msg.includes('not found') || msg.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ success: false, message: msg });
  }
};

export const adminGetAllOrders = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as PaginationQuery, 'createdAt');
    const result = await OrderService.getAllOrdersAdmin(pagination);
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ success: false, message: t(req.locale, 'validation.invalidOrderId') });

    const { status } = adminUpdateOrderStatusSchema.parse(req.body);
    const order = await OrderService.updateOrderStatusAdmin(orderId, status);

    await audit({
      userId: req.user?.id,
      action: AuditActions.ADMIN_ORDER_STATUS_CHANGED,
      entity: 'Order',
      entityId: orderId,
      details: `Status changed to ${status}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: t(req.locale, 'order.statusUpdated'), data: order });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Validation error' });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const status = msg.includes('not found') || msg.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ success: false, message: msg });
  }
};

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const adminExportOrders = async (req: Request, res: Response) => {
  try {
    const { format, limit } = adminExportQuerySchema.parse(req.query);
    if (format !== 'csv') return res.status(400).json({ success: false, message: t(req.locale, 'order.csvOnly') });

    const orders = await OrderService.getOrdersForExport(limit);
    const headers = ['id', 'userId', 'userName', 'userEmail', 'status', 'paymentStatus', 'subtotal', 'shippingCost', 'discount', 'total', 'address', 'createdAt'];
    const rows = orders.map((o) => [
      o.id,
      o.userId,
      escapeCsv(o.user?.name ?? ''),
      escapeCsv(o.user?.email ?? ''),
      o.status,
      o.paymentStatus,
      o.subtotal,
      o.shippingCost,
      o.discount,
      o.total,
      escapeCsv([o.address?.street, o.address?.city, o.address?.postalCode, o.address?.country].filter(Boolean).join(', ')),
      o.createdAt.toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    await audit({
      userId: req.user?.id,
      action: AuditActions.ADMIN_ORDERS_EXPORTED,
      entity: 'Order',
      details: `Exported ${orders.length} orders as CSV`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Validation error' });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
};
