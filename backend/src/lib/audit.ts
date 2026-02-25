import { prisma } from './prisma';
import logger from './logger';

interface AuditEntry {
  userId?: number | undefined;
  action: string;
  entity: string;
  entityId?: number | undefined;
  details?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export async function audit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        details: entry.details ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
    logger.info({ audit: entry }, 'audit_event');
  } catch (err) {
    logger.error({ err, audit: entry }, 'Failed to write audit log');
  }
}

export const AuditActions = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  REGISTER: 'REGISTER',
  LOGOUT: 'LOGOUT',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  USER_STATUS_TOGGLED: 'USER_STATUS_TOGGLED',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_PAID: 'ORDER_PAID',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  FILE_UPLOADED: 'FILE_UPLOADED',
} as const;
