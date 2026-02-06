import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const UserService = {
  // Obtener perfil por ID
  async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, profileImage: true, role: true, isActive: true }
    });
  },

  // Actualizar perfil
  async updateProfile(userId: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.profileImage) updateData.profileImage = data.profileImage;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true }
    });
  },

  // Soft Delete (Desactivar cuenta)
  async deactivateAccount(userId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  },

  // Admin: Listar todos
  async getAllUsers() {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  },

  // Admin: Toggle Status
  async toggleUserStatus(userId: number, status: boolean) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: status },
      select: { id: true, isActive: true }
    });
  }
};