import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../lib/s3';
import path from 'path';
import crypto from 'crypto';
import { t } from '../i18n/t';

// Security filter: only allow images
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(t(req.locale, 'middleware.invalidFormat')), false);
  }
};

// S3 storage configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },

  
  key: (req: any, file, cb) => {
    const folder = req.body.folder ? req.body.folder : 'products';
    const uniqueSuffix = crypto.randomUUID();
    const extension = path.extname(file.originalname);
    cb(null, `${folder}/${uniqueSuffix}${extension}`);
  }
});

export const upload = multer({
  storage: s3Storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});