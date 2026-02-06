// import { Request, Response } from 'express';
// import { VariantService } from '../services/variantService';
// import { createVariantSchema } from '../validation/variantSchema';

// export const createVariant = async (req: Request, res: Response) => {
//   try {
//     const data = createVariantSchema.parse(req.body);
//     const variant = await VariantService.create(data);
//     res.status(201).json({ success: true, data: variant });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const deleteVariant = async (req: Request, res: Response) => {
//   try {
//     await VariantService.delete(Number(req.params.id));
//     res.json({ success: true, message: 'Variante eliminada' });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: 'No se pudo eliminar' });
//   }
// };





import { Request, Response } from 'express';
import { VariantService } from '../services/variantService';
import { createVariantSchema, updateVariantSchema } from '../validation/variantSchema';

export const createVariant = async (req: Request, res: Response) => {
  try {
    const data = createVariantSchema.parse(req.body);
    const variant = await VariantService.create(data);
    res.status(201).json({ success: true, data: variant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateVariantSchema.parse(req.body);
    const variant = await VariantService.update(Number(id), data);
    res.json({ success: true, data: variant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    await VariantService.delete(Number(req.params.id));
    res.json({ success: true, message: 'Variante eliminada' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'No se pudo eliminar (¿Tiene pedidos?)' });
  }
};