import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../lib/s3';
import path from 'path';
import crypto from 'crypto';

// 1. Filtro de Seguridad: Solo permitir imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Solo se permiten imágenes (JPEG, PNG, WEBP).'), false);
  }
};

// 2. Configuración de Almacenamiento en S3
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE, // Vital para que el navegador muestre la imagen y no la descargue
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },

  
  key: (req: any, file, cb) => {
    // Organizar por carpetas (ej: "products/...") o "misc" por defecto
    const folder = req.body.folder ? req.body.folder : 'products';
    
    // Generar nombre único para evitar sobrescribir archivos
    const uniqueSuffix = crypto.randomUUID();
    const extension = path.extname(file.originalname);
    
    // Resultado ej: products/550e8400-e29b-41d4-a716-446655440000.jpg
    cb(null, `${folder}/${uniqueSuffix}${extension}`);
  }
});

// 3. Exportar el middleware configurado
export const upload = multer({
  storage: s3Storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB por archivo
  }
});