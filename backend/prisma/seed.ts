import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'djempsly120@gmail.com';
  const adminPassword = 'Admin@2026!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN', isVerified: true, isActive: true },
    });
    console.log(`\n  ✓ Admin account already exists — role set to ADMIN`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
      },
    });
    console.log(`\n  ✓ Admin account created`);
  }

  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  Admin Credentials                   ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  Email:    ${adminEmail.padEnd(24)} ║`);
  console.log(`  ║  Password: ${adminPassword.padEnd(24)} ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
