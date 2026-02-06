import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Aquí podrías agregar lógica para borrar también de S3 si quisieras ser muy pro,
    // pero borrar de la BD es suficiente para que desaparezca de la tienda.
    
    await prisma.productImage.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Imagen no encontrada o error al eliminar' });
  }
};