# Plan de seguridad empresarial – Marketplace multi-tenant multi-vendor

Estado frente al plan de 11 capas. Leyenda: ✅ Implementado | 🟡 Parcial | ❌ Pendiente | 📋 Documentado (requiere servicios externos).

---

## CAPA 1: Autenticación multi-actor

| Requisito | Estado | Notas |
|-----------|--------|--------|
| 4 tipos: COMPRADOR, VENDEDOR, ADMIN_MARKETPLACE, DELIVERY | 🟡 | Schema: USER (=COMPRADOR), VENDOR, ADMIN, SUPPORT. Falta DELIVERY explícito. |
| JWT HttpOnly cookies + fingerprint | 🟡 | JWT en cookie `access_token`; fingerprint no implementado. |
| Access 15 min, Refresh 30 días | ✅ | `utils/tokens.ts`: ACCESS_TOKEN_TTL=15m, REFRESH_TOKEN_DAYS=30 (env). |
| MFA/2FA obligatorio VENDEDOR y ADMIN | ✅ | Login devuelve mustEnroll2FA si rol ADMIN/VENDOR y 2FA no habilitado; no se emiten tokens hasta 2FA. |
| OAuth2 Google, Facebook, Apple | 🟡 | Google: GET /auth/google, GET /auth/google/callback (env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI). Facebook/Apple: pendiente. |
| Magic links compradores | ✅ | POST /auth/magic-link (email), GET|POST /auth/magic-link/verify?token= (login sin contraseña). |
| Bloqueo tras 5 intentos fallidos | ✅ | `authService.ts`: MAX_LOGIN_ATTEMPTS=5, LOCK_DURATION 30 min. |
| Verificación email obligatoria | ✅ | register + verifyEmail / verifyByCode. |
| Verificación teléfono SMS (Twilio) | ❌ | 📋 Integración Twilio pendiente. |
| Device tracking / alerta device nuevo | ✅ | Login acepta deviceFingerprint (body); KnownDevice + newDevice en respuesta. |
| Sesión máxima 30 días inactivo | ✅ | Refresh token 30 días; opcional limpiar por lastActive. |

---

## CAPA 2: Autorización marketplace

| Requisito | Estado | Notas |
|-----------|--------|--------|
| RBAC + ABAC | 🟡 | RBAC: requireAdmin, requireSupport, requireVendor, requireRoles(roles[]). ABAC no formalizado. |
| Roles: SUPER_ADMIN, ADMIN, MODERADOR, VENDOR, COMPRADOR, DELIVERY, SOPORTE, AUDITOR | 🟡 | Enum: USER, ADMIN, SUPPORT, VENDOR, DELIVERY. requireRoles(['ADMIN','SUPPORT']) etc. |
| Vendedor solo ve/edita SUS productos y órdenes | 🟡 | requireVendor + req.vendorId; dashboard/profile por userId; productos CRUD admin-only. |
| Comprador solo SUS órdenes/datos | ✅ | OrderService.getMyOrders(userId), getOrderById(userId). |
| Moderador suspende vendedores/productos | 🟡 | Admin puede cambiar status; rol MODERATOR y permisos específicos opcionales. |
| Aislamiento multi-tenant entre vendedores | ✅ | Queries por vendorId (VendorService por userId → vendor.id). |
| API keys con scopes por vendedor | ✅ | Scopes: products, orders, analytics, inventory, reports:export, payouts, profile (read/write). apiKeyAuth(scope). |

---

## CAPA 3: Protección de pagos

| Requisito | Estado | Notas |
|-----------|--------|--------|
| No almacenar datos tarjeta (PCI DSS) | ✅ | Stripe/PayPal tokenización. |
| Split payments / escrow | 🟡 | Lógica de comisión y payouts; escrow según flujo de orden. |
| Refunds admin o por disputa | ✅ | Disputas y flujo admin. |
| Webhook verification (firma) | ✅ | Stripe webhook signature verification. |
| Idempotency keys cobros | ✅ | idempotencyMiddleware en create-intent y mercadopago/create (X-Idempotency-Key). |
| Reconciliación automática diaria | ❌ | 📋 Job programado + reportes. |
| Alertas transacciones > $500, refunds > 10% | ❌ | 📋 Integrable con audit + notificaciones. |

---

## CAPA 4: Anti-fraude eCommerce

| Requisito | Estado | Notas |
|-----------|--------|--------|
| Rate limit login 5/min | ✅ | authStrictLimiter en auth (login, login/2fa). |
| Rate limit checkout 3/min por usuario | ✅ | checkoutLimiter en POST /orders. |
| Rate limit búsqueda 60/min | ✅ | searchLimiter en GET /search y autocomplete. |
| Rate limit API vendedor 100/min | ✅ | apiVendorLimiter en rutas vendor (me, dashboard, register). |
| Creación cuenta 3/hora por IP | ✅ | registerLimiter en POST /auth/register. |
| Detección cuentas duplicadas (email, tel, device) | 🟡 | Email único; tel/device opcional. |
| Reviews falsos / price manipulation / scraping | ❌ | 📋 Reglas y jobs. |
| Validación inventario al checkout | ✅ | OrderService / stock check. |
| CAPTCHA registro, checkout, contacto | 🟡 | Frontend Turnstile; validar en backend. |
| Velocity checks / AVS / blacklist emails / BIN | ❌ | 📋 Servicios externos o heurísticas. |

---

## CAPA 5: Seguridad de contenido

| Requisito | Estado | Notas |
|-----------|--------|--------|
| Sanitización inputs (XSS) | ✅ | sanitizeMiddleware (escape HTML, patrones peligrosos). |
| Imágenes: MIME real, resize server, strip EXIF, malware scan, max 10MB/20 por producto | 🟡 | Validación y límites; EXIF/malware según stack. |
| Moderación productos prohibidos / blacklist keywords | ❌ | 📋 Lista + queue revisión. |
| Reviews: 1 por compra, anti-spam | 🟡 | Un review por userId+productId; anti-spam opcional. |
| Rich text whitelist HTML | 🟡 | Sanitización actual; whitelist explícita en contenido rico. |

---

## CAPA 6: Protección contra ataques

| Requisito | Estado | Notas |
|-----------|--------|--------|
| DDoS / rate limiting | ✅ | Rate limiters por ruta. |
| SQL injection | ✅ | Prisma parameterized; sanitize detecta patrones. |
| CSRF tokens HMAC | ✅ | csrfMiddleware. |
| Clickjacking / CSP | ✅ | X-Frame-Options, CSP en producción. |
| CORS whitelist | ✅ | app.ts allowedOrigins. |
| HSTS includeSubDomains + preload | ✅ | securityHeaders producción. |
| Brute force / session fixation / open redirect | ✅ | Bloqueo 5 intentos; regenerar token; validar redirects. |
| SSRF / parameter pollution | 🟡 | Validación inputs; bloquear IPs internas en llamadas salientes. |

---

## CAPA 7: Privacidad y datos

| Requisito | Estado | Notas |
|-----------|--------|--------|
| GDPR/CCPA: olvido, exportar datos, consentimiento, cookie banner | 🟡 | Endpoints export/delete; consent en CookieConsent. |
| Cifrado AES-256 PII en BD | 🟡 | lib/piiEncryption.ts: encryptPii/decryptPii (PII_ENCRYPTION_KEY); maskForLog para logs. |
| Enmascaramiento en logs | 🟡 | No loguear passwords; emails/IPs según política. |
| Data retention / anonimizar inactivos | ❌ | 📋 Políticas y jobs. |
| Vendedor no ve datos completos comprador | ✅ | Solo nombre/ciudad para envío. |

---

## CAPA 8: Infraestructura

| Requisito | Estado | Notas |
|-----------|--------|--------|
| WAF / CDN / Signed URLs / S3 encryption / secrets / containers / health / blue-green | 📋 | Despliegue e infra; health en /health. |

---

## CAPA 9: Monitoreo y alertas

| Requisito | Estado | Notas |
|-----------|--------|--------|
| Audit trail inmutable | ✅ | AuditLog + audit(). |
| Alertas tiempo real (transacciones, multi-cuenta, inyección, error rate, latencia) | 🟡 | Métricas Prometheus; alertas en Alertmanager/externas. |
| Dashboard seguridad admin | ✅ | GET /security/dashboard (login failed/success, locked, activeSessions, pendingKyc, recentAudit). |

---

## CAPA 10: Protección de código

| Requisito | Estado | Notas |
|-----------|--------|--------|
| Licenciamiento HMAC por dominio / ofuscación / anti-tamper / phone-home | 📋 | Fuera del backend estándar; cliente/licencia si aplica. |

---

## CAPA 11: Onboarding vendedor

| Requisito | Estado | Notas |
|-----------|--------|--------|
| KYC, documento identidad, dirección negocio, cuenta bancaria | ✅ | documentType: ID_CARD|PASSPORT|TAX_ID; documentUrl obligatorio; rechazo exige notes; validación submitKycSchema/adminReviewKycSchema. |
| Periodo prueba / escrow 30 días / scoring / suspensión automática | 🟡 | VendorStatus PENDING/ACTIVE/SUSPENDED; reglas en servicio. |

---

## Archivos clave

- **Auth:** `backend/src/services/authService.ts`, `utils/tokens.ts`, `middleware/authMiddleware.ts`
- **Rate limits:** `middleware/rateLimiters.ts`
- **Seguridad:** `middleware/securityHeaders.ts`, `middleware/sanitizeMiddleware.ts`, `middleware/csrfMiddleware.ts`
- **Audit:** `lib/audit.ts`
- **Pagos:** `routes/paymentRoutes.ts`, controladores de pago
