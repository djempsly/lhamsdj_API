import { prisma } from '../lib/prisma';

export const AddressService = {

  // Crear dirección
  async create(userId: number, data: any) {
    // Si es la primera dirección que agrega, la hacemos default automáticamente
    const count = await prisma.address.count({ where: { userId } });
    if (count === 0) {
      data.isDefault = true;
    }

    // Si esta nueva es default, desmarcamos las anteriores
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return await prisma.address.create({
      data: {
        ...data,
        userId
      }
    });
  },

  // Obtener mis direcciones
  async getAll(userId: number) {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' } // La default sale primero
    });
  },

  // Obtener una por ID (Validando que sea mía)
  async getById(userId: number, addressId: number) {
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) return null;
    return address;
  },

  // Eliminar
  async delete(userId: number, addressId: number) {
    // Verificamos propiedad
    const address = await this.getById(userId, addressId);
    if (!address) throw new Error("Dirección no encontrada o no autorizada");

    // Verificar si tiene órdenes asociadas (para no romper integridad)
    const ordersCount = await prisma.order.count({ where: { addressId } });
    if (ordersCount > 0) {
      throw new Error("No se puede eliminar esta dirección porque tiene pedidos asociados.");
    }

    return await prisma.address.delete({
      where: { id: addressId }
    });
  }
};