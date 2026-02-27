import { prisma } from '../lib/prisma';
import { getAdapter, registerFromConfig } from '../dropshipping/adapterRegistry';
import { DropshipService } from '../services/dropshipService';
import logger from '../lib/logger';

async function syncInventory() {
  try {
    const activeLinks = await prisma.supplierProduct.findMany({
      where: { isActive: true, supplier: { status: 'ACTIVE' } },
      include: { supplier: true },
    });

    let updated = 0;
    for (const link of activeLinks) {
      const adapter = getAdapter(link.supplier.apiType);
      const stock = await adapter.getStock(link.supplierSku);

      if (stock >= 0 && stock !== link.supplierStock) {
        await prisma.supplierProduct.update({
          where: { id: link.id },
          data: { supplierStock: stock, lastSyncedAt: new Date() },
        });

        await prisma.product.update({
          where: { id: link.productId },
          data: { stock },
        });

        updated++;
      }
    }

    if (updated > 0) logger.info({ updated }, 'Dropship inventory synced');
  } catch (err) {
    logger.error({ err }, 'Dropship inventory sync failed');
  }
}

async function syncOrders() {
  try {
    await DropshipService.syncSupplierOrders();
  } catch (err) {
    logger.error({ err }, 'Dropship order sync failed');
  }
}

async function retryFailed() {
  try {
    await DropshipService.retryFailedOrders();
  } catch (err) {
    logger.error({ err }, 'Dropship retry failed');
  }
}

async function registerAdaptersFromDB() {
  const suppliers = await prisma.supplier.findMany({ where: { status: 'ACTIVE', apiType: { not: 'MANUAL' } } });
  for (const s of suppliers) {
    if (s.apiBaseUrl && s.apiKey) {
      registerFromConfig(s.apiType, s.apiBaseUrl, s.apiKey);
    }
  }
}

const SYNC_INTERVAL = 30 * 60 * 1000; // 30 min
const RETRY_INTERVAL = 2 * 60 * 1000; // 2 min

export function startDropshipSyncJob() {
  registerAdaptersFromDB();

  setTimeout(() => {
    syncInventory();
    syncOrders();
  }, 10000);

  setInterval(() => {
    syncInventory();
    syncOrders();
  }, SYNC_INTERVAL);

  setInterval(retryFailed, RETRY_INTERVAL);

  logger.info('Dropship sync job started (inventory/orders: 30min, retries: 2min)');
}
