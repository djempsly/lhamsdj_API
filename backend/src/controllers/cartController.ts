import { Request, Response } from 'express';
import { CartService } from '../services/cartService';
import { addToCartSchema, updateCartItemSchema } from '../validation/cartSchema';

export const getMyCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const cart = await CartService.getCart(userId);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const validatedData = addToCartSchema.parse(req.body);
    const item = await CartService.addToCart(userId, validatedData);
    res.status(201).json({ success: true, message: 'Producto agregado', data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { itemId } = req.params;
    const { quantity } = updateCartItemSchema.parse(req.body);
    
    const updatedItem = await CartService.updateItemQuantity(userId, Number(itemId), quantity);
    res.json({ success: true, data: updatedItem });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { itemId } = req.params;
    
    await CartService.removeItem(userId, Number(itemId));
    res.json({ success: true, message: 'Item eliminado del carrito' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    await CartService.clearCart(userId);
    res.json({ success: true, message: 'Carrito vaciado correctamente' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};