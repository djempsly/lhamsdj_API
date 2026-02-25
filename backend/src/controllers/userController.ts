import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { updateProfileSchema, toggleUserStatusSchema } from '../validation/userSchema';

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const user = await UserService.getProfile(userId);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });

    const validatedData = updateProfileSchema.parse(req.body);
    const user = await UserService.updateProfile(userId, validatedData);
    res.json({ success: true, message: 'Perfil actualizado', data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });

    await UserService.deactivateAccount(userId);
    res.json({ success: true, message: 'Cuenta desactivada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const targetId = Number(req.params.id);
    if (isNaN(targetId)) return res.status(400).json({ success: false, message: 'ID inválido' });

    if (req.user?.id === targetId) {
      return res.status(400).json({ success: false, message: 'No puedes desactivarte a ti mismo' });
    }

    const { isActive } = toggleUserStatusSchema.parse(req.body);
    const user = await UserService.toggleUserStatus(targetId, isActive);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
