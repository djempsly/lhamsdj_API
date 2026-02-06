import { Router } from 'express';
import { 
  getMyCart, 
  addItemToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} from '../controllers/cartController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMyCart); // Ver mi carrito
router.post('/items', authenticate, addItemToCart); // Agregar producto
router.patch('/items/:itemId', authenticate, updateCartItem); // Cambiar cantidad
router.delete('/items/:itemId', authenticate, removeCartItem); // Quitar un producto
router.delete('/', authenticate, clearCart); // Vaciar todo

export default router;