import { Router } from 'express';
import { getCurrencies, convertCurrency, syncRates, getCountries, seedCountries } from '../controllers/currencyController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCurrencies);
router.post('/convert', convertCurrency);
router.get('/countries', getCountries);
router.post('/sync', authenticate, requireAdmin, syncRates);
router.post('/seed-countries', authenticate, requireAdmin, seedCountries);

export default router;
