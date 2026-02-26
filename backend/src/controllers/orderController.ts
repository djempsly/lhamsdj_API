import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { createOrderSchema } from '../validation/orderSchema';
import { parsePagination } from '../utils/pagination';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const data = createOrderSchema.parse(req.body);
    const order = await OrderService.createOrder(userId, data);
    res.status(201).json({ success: true, message: 'Orden creada exitosamente', data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const pagination = parsePagination(req.query as any, 'createdAt');
    const result = await OrderService.getMyOrders(userId, pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const order = await OrderService.getOrderById(userId, Number(id));
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const payOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    const order = await OrderService.markAsPaid(userId, Number(id));
    res.json({ success: true, message: 'Pago registrado', data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminGetAllOrders = async (req: Request, res: Response) => {
  try {
    const pagination = parsePagination(req.query as any, 'createdAt');
    const result = await OrderService.getAllOrdersAdmin(pagination);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: string };
    if (!status) return res.status(400).json({ success: false, message: 'status es requerido' });
    const order = await OrderService.updateOrderStatusAdmin(id, status);
    res.json({ success: true, message: 'Estado actualizado', data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const adminExportOrders = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || 'csv';
    const limit = Math.min(Number(req.query.limit) || 5000, 10000);
    if (format !== 'csv') return res.status(400).json({ success: false, message: 'Solo format=csv está soportado' });

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
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
