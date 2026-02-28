import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slug(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

const CATEGORIES = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Personal Care', slug: 'personal-care' },
];

const PRODUCTS = [
  // ── Technology (8 products) ──
  { cat: 'technology', name: 'Wireless Noise-Cancelling Headphones', price: 79.99, stock: 150, description: 'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and deep bass. Bluetooth 5.3 with multipoint connection.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { cat: 'technology', name: 'Smart Watch Ultra Pro', price: 199.99, stock: 80, description: 'Advanced fitness tracker with AMOLED display, GPS, heart rate monitor, blood oxygen sensor, and 14-day battery life. Water resistant to 50m.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
  { cat: 'technology', name: 'Portable Bluetooth Speaker', price: 49.99, stock: 200, description: 'Waterproof IPX7 speaker with 360° surround sound, 24-hour playtime, built-in microphone, and RGB lighting effects.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600' },
  { cat: 'technology', name: 'USB-C Fast Charger 65W', price: 34.99, stock: 300, description: 'GaN charger with 3 ports (2x USB-C, 1x USB-A). Charges laptop, phone, and tablet simultaneously. Compact travel design.', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
  { cat: 'technology', name: 'Mechanical Gaming Keyboard', price: 89.99, stock: 120, description: 'RGB backlit mechanical keyboard with hot-swappable switches, programmable macros, aluminum frame, and anti-ghosting technology.', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
  { cat: 'technology', name: 'Wireless Earbuds Pro', price: 59.99, stock: 250, description: 'True wireless earbuds with hybrid ANC, transparency mode, 30-hour total battery, and IPX5 water resistance. Hi-Res audio certified.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600' },
  { cat: 'technology', name: '4K Webcam with Ring Light', price: 69.99, stock: 90, description: 'Ultra HD webcam with built-in adjustable ring light, auto-focus, noise-reducing dual microphones. Perfect for streaming and video calls.', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600' },
  { cat: 'technology', name: 'Portable Power Bank 20000mAh', price: 39.99, stock: 180, description: 'High-capacity portable charger with 22.5W fast charging, LED display, dual USB-C ports. Charges iPhone 15 four times.', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600' },

  // ── Fashion (8 products) ──
  { cat: 'fashion', name: 'Classic Leather Crossbody Bag', price: 64.99, stock: 100, description: 'Genuine leather crossbody bag with adjustable strap, multiple compartments, gold-tone hardware. Fits tablets up to 10 inches.', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600' },
  { cat: 'fashion', name: 'Oversized Aviator Sunglasses', price: 29.99, stock: 200, description: 'UV400 polarized aviator sunglasses with metal frame, gradient lenses, and anti-reflective coating. Unisex design.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600' },
  { cat: 'fashion', name: 'Premium Cotton Hoodie', price: 44.99, stock: 160, description: 'Heavyweight 380gsm French terry hoodie with kangaroo pocket, ribbed cuffs, and relaxed fit. Available in multiple colors.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600' },
  { cat: 'fashion', name: 'Minimalist Stainless Steel Watch', price: 119.99, stock: 75, description: 'Japanese quartz movement, sapphire crystal glass, genuine leather strap. 40mm case, water resistant to 30m. Elegant everyday timepiece.', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600' },
  { cat: 'fashion', name: 'Canvas Sneakers Low-Top', price: 39.99, stock: 220, description: 'Classic low-top canvas sneakers with vulcanized rubber sole, cushioned insole, and reinforced toe cap. Timeless street style.', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600' },
  { cat: 'fashion', name: 'Silk Patterned Scarf', price: 24.99, stock: 130, description: '100% mulberry silk scarf with hand-rolled edges. Versatile 90x90cm square design, perfect as neck scarf, headband, or bag accessory.', image: 'https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=600' },
  { cat: 'fashion', name: 'Denim Jacket Vintage Wash', price: 69.99, stock: 95, description: 'Classic denim jacket in vintage stonewash. Button closure, chest pockets, adjustable waist tabs. 100% cotton denim.', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600' },
  { cat: 'fashion', name: 'Leather Belt with Brushed Buckle', price: 34.99, stock: 170, description: 'Full-grain Italian leather belt with brushed nickel buckle. 35mm width, fits sizes 28-44. Arrives in gift box.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },

  // ── Beauty (7 products) ──
  { cat: 'beauty', name: 'Vitamin C Brightening Serum', price: 28.99, stock: 200, description: '20% Vitamin C serum with hyaluronic acid and vitamin E. Brightens dark spots, reduces fine lines, and boosts collagen. 30ml dropper bottle.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
  { cat: 'beauty', name: 'Retinol Night Cream', price: 35.99, stock: 150, description: 'Advanced retinol 0.5% night cream with peptides and ceramides. Reduces wrinkles, improves texture, and restores firmness. Dermatologist tested.', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600' },
  { cat: 'beauty', name: 'Hydrating Sheet Mask Set (10-Pack)', price: 19.99, stock: 300, description: 'Korean beauty sheet masks infused with hyaluronic acid, green tea, and collagen. Deep hydration and glow. 10 individually wrapped masks.', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600' },
  { cat: 'beauty', name: 'Matte Lipstick Collection (6 Shades)', price: 22.99, stock: 180, description: 'Long-lasting matte lipstick set with 6 everyday shades. Enriched with jojoba oil for comfort. Transfer-proof formula lasts 12+ hours.', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600' },
  { cat: 'beauty', name: 'Rose Gold Makeup Brush Set (12-Piece)', price: 32.99, stock: 140, description: 'Professional 12-piece brush set with synthetic bristles, rose gold ferrules, and vegan leather case. Includes face, eye, and lip brushes.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
  { cat: 'beauty', name: 'Micellar Cleansing Water 400ml', price: 14.99, stock: 250, description: 'Gentle no-rinse cleanser that removes makeup, dirt, and oil. Suitable for all skin types including sensitive. Fragrance-free formula.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600' },
  { cat: 'beauty', name: 'Eyebrow Lamination Kit', price: 26.99, stock: 110, description: 'At-home brow lamination kit for salon-quality results. Includes lifting lotion, setting solution, nourishing oil, and application tools. Lasts 6-8 weeks.', image: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=600' },

  // ── Personal Care (7 products) ──
  { cat: 'personal-care', name: 'Electric Sonic Toothbrush', price: 44.99, stock: 160, description: '5 brushing modes, 2-minute smart timer, IPX7 waterproof. Includes 4 replacement heads and travel case. 30-day battery on single charge.', image: 'https://images.unsplash.com/photo-1559650656-5d1d361ad10e?w=600' },
  { cat: 'personal-care', name: 'Aromatherapy Essential Oil Diffuser', price: 29.99, stock: 190, description: '300ml ultrasonic cool mist diffuser with 7 LED colors, auto-shutoff, and whisper-quiet operation. Perfect for bedroom or office.', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600' },
  { cat: 'personal-care', name: 'Bamboo Charcoal Teeth Whitening Kit', price: 24.99, stock: 200, description: 'LED teeth whitening system with activated charcoal gel. 16-minute treatment, 3 gel syringes included. Enamel-safe, peroxide-free.', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600' },
  { cat: 'personal-care', name: 'Stainless Steel Grooming Kit (18-Piece)', price: 29.99, stock: 130, description: 'Complete manicure and pedicure set with nail clippers, scissors, tweezers, ear picks, and more. Stored in a premium leather travel case.', image: 'https://images.unsplash.com/photo-1585652757141-8837d027e135?w=600' },
  { cat: 'personal-care', name: 'Hair Straightener Ceramic Flat Iron', price: 49.99, stock: 100, description: 'Titanium-coated ceramic plates, adjustable 120-230°C, 15-second heat up. Anti-frizz technology with negative ions. Dual voltage for travel.', image: 'https://images.unsplash.com/photo-1522338242992-e1a54571a9f7?w=600' },
  { cat: 'personal-care', name: 'Beard Grooming Kit', price: 27.99, stock: 140, description: 'Complete beard care set: oil, balm, wash, wooden comb, boar bristle brush, and stainless steel scissors. Natural ingredients, no parabens.', image: 'https://images.unsplash.com/photo-1621607505837-0d11be53fe68?w=600' },
  { cat: 'personal-care', name: 'Jade Roller & Gua Sha Set', price: 18.99, stock: 220, description: 'Natural jade facial roller and Gua Sha stone for lymphatic drainage, reduced puffiness, and improved circulation. Comes in velvet pouch.', image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600' },
];

async function main() {
  // ── Admin ──
  const adminEmail = 'djempsly120@gmail.com';
  const adminPassword = 'Admin@2026!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN', isVerified: true, isActive: true } });
    console.log('  ✓ Admin updated');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({ data: { name: 'Admin', email: adminEmail, password: hashedPassword, role: 'ADMIN', isActive: true, isVerified: true } });
    console.log('  ✓ Admin created');
  }

  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  Email:    ${adminEmail.padEnd(24)} ║`);
  console.log(`  ║  Password: ${adminPassword.padEnd(24)} ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);

  // ── Categories ──
  const categoryMap: Record<string, number> = {};

  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categoryMap[cat.slug] = existing.id;
      console.log(`  · Category "${cat.name}" already exists (id: ${existing.id})`);
    } else {
      const created = await prisma.category.create({ data: { name: cat.name, slug: cat.slug } });
      categoryMap[cat.slug] = created.id;
      console.log(`  ✓ Category "${cat.name}" created (id: ${created.id})`);
    }
  }

  // ── Products ──
  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const productSlug = slug(p.name);
    const existingProduct = await prisma.product.findUnique({ where: { slug: productSlug } });

    if (existingProduct) {
      skipped++;
      continue;
    }

    const categoryId = categoryMap[p.cat];
    if (!categoryId) {
      console.log(`  ✗ Category "${p.cat}" not found for "${p.name}"`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: productSlug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId,
        isActive: true,
        images: {
          create: [{ url: p.image }],
        },
      },
    });

    created++;
    console.log(`  ✓ Product #${product.id}: ${p.name} ($${p.price})`);
  }

  console.log(`\n  ══════════════════════════════════════`);
  console.log(`  Products created: ${created}`);
  console.log(`  Products skipped (already exist): ${skipped}`);
  console.log(`  Total categories: ${Object.keys(categoryMap).length}`);
  console.log(`  ══════════════════════════════════════\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
