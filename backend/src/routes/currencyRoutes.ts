import { Router } from 'express';
import { getCurrencies, convertCurrency, syncRates, getCountries, seedCountries, detectCurrency } from '../controllers/currencyController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCurrencies);
router.get('/detect', detectCurrency);
router.post('/convert', convertCurrency);
router.get('/countries', getCountries);
router.post('/sync', authenticate, requireAdmin, syncRates);
router.post('/seed-countries', authenticate, requireAdmin, seedCountries);

export default router;
