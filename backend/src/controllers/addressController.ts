import { Request, Response } from 'express';
import { AddressService } from '../services/addressService';
import { createAddressSchema } from '../validation/addressSchema';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const validatedData = createAddressSchema.parse(req.body);
    const address = await AddressService.create(userId, validatedData);
    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const addresses = await AddressService.getAll(userId);
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;
    await AddressService.delete(userId, Number(id));
    res.json({ success: true, message: 'Dirección eliminada' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};