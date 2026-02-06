// import { Router } from 'express';
// import { uploadImage } from '../controllers/uploadController';
// import { upload } from '../middleware/uploadMiddleware';
// import { authenticate, requireAdmin } from '../middleware/authMiddleware';

// const router = Router();

// // Endpoint: POST /api/v1/uploads
// // Solo Admin. Requiere Form-Data con campo 'image'
// router.post('/', authenticate, requireAdmin, upload.single('image'), uploadImage);

// export default router;




import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { upload } from '../middleware/uploadMiddleware';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';




const router = Router();

// POST /api/v1/uploads
// Requiere: 
// 1. Header 'Authorization' (Admin)
// 2. Body 'Form-Data' con key="image" (archivo) y opcional key="folder" (texto)
router.post('/', authenticate, requireAdmin, upload.single('image'), uploadImage);

export default router;