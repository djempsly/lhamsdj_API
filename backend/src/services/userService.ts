import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { PaginationResult, buildPaginatedResponse } from '../utils/pagination';

export const UserService = {
  async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, profileImage: true, role: true, isActive: true, isVerified: true },
    });
  },

  async updateProfile(userId: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.profileImage) updateData.profileImage = data.profileImage;

    if (data.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: userId } } });
      if (existing) throw new Error('El email ya está en uso por otra cuenta');
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true },
    });
  },

  async deactivateAccount(userId: number) {
    return await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  },

  async getAllUsers(pagination: PaginationResult) {
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.user.count(),
    ]);
    return buildPaginatedResponse(data, total, pagination);
  },

  async toggleUserStatus(userId: number, status: boolean) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: status },
      select: { id: true, isActive: true },
    });
  },
};
