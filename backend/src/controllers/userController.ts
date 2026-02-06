import { Request, Response } from 'express';
import { UserService } from '../services/userService';

// Self
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Viene del middleware
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const user = await UserService.getProfile(userId);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const user = await UserService.updateProfile(userId, req.body);
    res.json({ success: true, message: 'Actualizado', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    await UserService.deactivateAccount(userId);
    res.json({ success: true, message: 'Cuenta desactivada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin
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
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await UserService.toggleUserStatus(Number(id), Boolean(isActive));
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};