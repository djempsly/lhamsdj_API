// import { Request, Response } from 'express';

// export const uploadImage = (req: Request, res: Response) => {
//   try {
//     // Verificamos si Multer procesó el archivo
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
//     }

//     // Casteamos a 'any' porque TypeScript a veces no ve la propiedad .location de multer-s3
//     const fileData = req.file as any; 

//     // Devolvemos la URL pública
//     res.status(201).json({
//       success: true,
//       message: 'Imagen subida correctamente',
//       data: {
//         url: fileData.location, // URL de AWS S3
//         key: fileData.key       // Ruta interna (útil para borrar luego)
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }

    const fileData = req.file as any; 

    // LÓGICA DE CLOUDFRONT
    // Si tenemos la variable en .env, usamos CloudFront. Si no, usamos S3 directo.
    let finalUrl = fileData.location;
    
    if (process.env.CLOUDFRONT_URL) {
      // Reemplazamos la URL base de S3 por la de CloudFront
      // fileData.key es "products/foto.jpg"
      finalUrl = `${process.env.CLOUDFRONT_URL}/${fileData.key}`;
    }

    res.status(201).json({
      success: true,
      message: 'Imagen subida correctamente',
      data: {
        url: finalUrl,      // <--- Ahora devuelve la URL rápida y segura
        key: fileData.key   
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};










