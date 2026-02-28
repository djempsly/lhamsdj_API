import { Router } from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/uploadController';
import { upload } from '../middleware/uploadMiddleware';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { validateImageExtension } from '../middleware/imageValidator';
import { uploadLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post(
  '/',
  uploadLimiter,
  authenticate,
  requireAdmin,
  upload.array('images', 10),
  uploadMultipleImages,
);

router.post(
  '/single',
  uploadLimiter,
  authenticate,
  requireAdmin,
  upload.single('image'),
  validateImageExtension,
  uploadImage,
);

export default router;
