import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { createOrderSchema } from '../validation/orderSchema';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { addressId } = createOrderSchema.parse(req.body);
    
    const order = await OrderService.createOrder(userId, addressId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Orden creada exitosamente', 
      data: order 
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const orders = await OrderService.getMyOrders(userId);
    res.json({ success: true, data: orders });
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



// Simular pago
export const payOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params; // ID de la orden
    
    const order = await OrderService.markAsPaid(userId, Number(id));
    
    res.json({ success: true, message: 'Pago simulado exitoso. Orden Pagada.', data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};