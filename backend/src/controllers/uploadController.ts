import { Request, Response } from 'express';
import { t } from '../i18n/t';

export const uploadImage = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: t(req.locale, 'upload.noFile') });
    }

    const fileData = req.file as any;

    let finalUrl = fileData.location;
    if (process.env.CLOUDFRONT_URL) {
      finalUrl = `${process.env.CLOUDFRONT_URL}/${fileData.key}`;
    }

    res.status(201).json({
      success: true,
      message: t(req.locale, 'upload.success'),
      data: { url: finalUrl, key: fileData.key },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMultipleImages = (req: Request, res: Response) => {
  try {
    const files = req.files as any[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: t(req.locale, 'upload.noFile') });
    }

    const data = files.map((file) => {
      let finalUrl = file.location;
      if (process.env.CLOUDFRONT_URL) {
        finalUrl = `${process.env.CLOUDFRONT_URL}/${file.key}`;
      }
      return { url: finalUrl, key: file.key };
    });

    res.status(201).json({
      success: true,
      message: t(req.locale, 'upload.success'),
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
