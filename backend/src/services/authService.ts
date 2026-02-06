import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { sendVerificationCode } from '../utils/sender';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const AuthService = {
  // --- REGISTER ---
  async register(data: any) {
    const { email, password, name, phone } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('El correo ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'USER',
        isActive: true
      },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    return { user: newUser, token };
  },

  // --- LOGIN ---
  async login(data: any) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('Credenciales inválidas');
    if (!user.isActive) throw new Error('Cuenta desactivada');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  },

  // --- FORGOT PASSWORD ---
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Por seguridad, si no existe no lanzamos error, solo retornamos false o true
    if (!user || !user.isActive) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    const hashedToken = await bcrypt.hash(code, 10);

    await prisma.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry }
    });

    await sendVerificationCode(email, code);
    return true;
  },

  // --- RESET PASSWORD ---
  async resetPassword(data: any) {
    const { email, code, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) throw new Error('Solicitud inválida');
    if (new Date() > user.resetTokenExpiry) throw new Error('El código ha expirado');

    const validCode = await bcrypt.compare(code, user.resetToken);
    if (!validCode) throw new Error('Código incorrecto');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });

    return true;
  }
};