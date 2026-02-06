import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, payOrder  } from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';

//import { createOrder, getMyOrders, getOrderById, payOrder } from '../controllers/orderController'; // <--- Importar payOrder


const router = Router();

router.post('/', authenticate, createOrder); // Checkout
router.get('/', authenticate, getMyOrders);  // Historial
router.get('/:id', authenticate, getOrderById); // Detalle



// Nueva ruta para simular pago
//router.patch('/:id/pay', authenticate, payOrder); 

export default router;