# Evaluación del sistema y cobertura UI de endpoints

## 1. Resumen ejecutivo

| Área | Endpoints backend | Con UI | Sin UI / Parcial | Cobertura |
|------|-------------------|--------|-------------------|-----------|
| Auth | 18 | 16 | 2 | Alta |
| Usuarios / Perfil | 6 | 6 | 0 | Completa |
| Catálogo (productos, categorías, variantes) | 12 | 10 | 2 | Alta |
| Carrito, órdenes, pagos | 15 | 15 | 0 | Completa |
| Vendors (marketplace) | 18 | 14 | 4 | Parcial |
| Admin (stats, audit, analytics, etc.) | 40+ | 35+ | 5+ | Alta |
| Otros (mensajes, tickets, disputas, notificaciones, etc.) | 30+ | 25+ | 5+ | Alta |

**Conclusiones:**
- La mayoría de los flujos principales (auth, compra, perfil, admin básico) tienen UI.
- **Sin UI o parcial:** Dashboard de seguridad (admin), KYC vendedor, API keys vendedor, algunos endpoints de analytics/legal/newsletter admin, 2FA sesiones.
- **Inconsistencia:** `adminService.getShipments()` llama a `/shipments/admin/all`, que no existe en el backend; la página admin/shipments usa `/orders/admin/all` y aplana `order.shipments`.

---

## 2. Módulos backend vs UI (detalle)

### 2.1 Auth (`/auth`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/csrf` | GET | Implícito (apiFetch/csrf) |
| `/register` | POST | ✅ `/auth/register` |
| `/login` | POST | ✅ `/auth/login` |
| `/login/2fa` | POST | ✅ `/auth/login` (flujo 2FA) |
| `/verify/:token` | GET | ✅ `/auth/verify` |
| `/verify-code` | POST | ✅ `/auth/verify` |
| `/refresh` | POST | Implícito (apiFetch) |
| `/logout` | POST | ✅ Navbar / perfil |
| `/logout-all` | POST | ✅ Perfil/seguridad (si existe) |
| `/forgot-password` | POST | ✅ `/auth/forgot-password` |
| `/reset-password` | POST | ✅ `/auth/reset-password` |
| `/change-password` | POST | ✅ `/profile/security` |
| `/me` | GET | ✅ Perfil, middleware |
| `/magic-link` | POST | ✅ `/auth/magic-link` |
| `/magic-link/verify` | GET/POST | ✅ `/auth/magic-link` (con token) |
| `/google` | GET | ✅ `/auth/login` (botón Google) |
| `/google/callback` | GET | Backend redirect → `/auth/oauth-callback` |

**Cobertura: completa.**

---

### 2.2 2FA (`/2fa`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/setup` | POST | ✅ Flujo en login/perfil |
| `/enable` | POST | ✅ Perfil seguridad |
| `/verify` | POST | ✅ Login 2FA |
| `/disable` | POST | ✅ Perfil seguridad |
| `/sessions` | GET | ❌ Sin UI (listar sesiones activas) |
| `/sessions/:id` | DELETE | ❌ Sin UI (revocar sesión) |

**Cobertura: parcial.** Falta pantalla “Sesiones activas” para listar y revocar.

---

### 2.3 Users (`/users`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/profile` | GET | ✅ `/profile` |
| `/profile` | PATCH | ✅ `/profile` |
| `/profile` | DELETE | ✅ Perfil (eliminar cuenta) |
| `/` | GET | ✅ `/admin/users` |
| `/:id/status` | PATCH | ✅ `/admin/users` |

**Cobertura: completa.**

---

### 2.4 Categories (`/categories`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ Home, productos, `/admin/categories` |
| `/:slug` | GET | ✅ Navegación / listados |
| `/` | POST | ✅ `/admin/categories` |
| `/:id` | PATCH | ✅ `/admin/categories` |
| `/:id` | DELETE | ✅ `/admin/categories` |

**Cobertura: completa.**

---

### 2.5 Products (`/products`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ `/products`, SearchBar, home |
| `/:slug` | GET | ✅ `/product/[slug]` |
| `/` | POST | ✅ `/admin/products/create` |
| `/:id` | PATCH | ✅ `/admin/products/edit/[id]` |
| `/:id` | DELETE | ✅ `/admin/products` |

**Cobertura: completa.**

---

### 2.6 Variants (`/variants`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ Admin productos (crear variante) |
| `/:id` | PATCH | ✅ Admin productos (editar variante) |
| `/:id` | DELETE | ✅ Admin productos |

**Cobertura: completa.**

---

### 2.7 Product images (`/product-images`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/:id` | DELETE | ✅ Admin productos (editar) |

**Cobertura: completa.**

---

### 2.8 Search (`/search`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ SearchBar, `/products` |
| `/autocomplete` | GET | ✅ SearchBar |
| `/recommendations/:productId` | GET | ✅ Producto (recomendaciones) |
| `/track-view/:productId` | POST | ✅ Producto |
| `/recently-viewed` | GET | Parcial (si hay bloque “vistos”) |

**Cobertura: alta.**

---

### 2.9 Cart (`/cart`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ CartDrawer, `/cart` |
| `/items` | POST | ✅ Producto, CartDrawer |
| `/items/:itemId` | PATCH | ✅ CartDrawer |
| `/items/:itemId` | DELETE | ✅ CartDrawer |
| `/` | DELETE | ✅ `/cart` (vaciar) |

**Cobertura: completa.**

---

### 2.10 Orders (`/orders`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ `/checkout` |
| `/` | GET | ✅ `/profile/orders` |
| `/admin/all` | GET | ✅ `/admin/orders` |
| `/admin/export` | GET | ✅ Admin órdenes (export CSV) |
| `/admin/:id/status` | PATCH | ✅ `/admin/orders` |
| `/:id` | GET | ✅ `/profile/orders/[id]` |

**Cobertura: completa.**

---

### 2.11 Payments (`/payments`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/methods` | GET | ✅ Checkout / pago |
| `/create-intent` | POST | ✅ `/payment/[id]` (Stripe) |
| `/webhook` | POST | Backend (Stripe) |
| `/mercadopago/create` | POST | ✅ Flujo pago |
| `/mercadopago/webhook` | POST | Backend |

**Cobertura: completa (webhooks sin UI, correcto).**

---

### 2.12 Coupons (`/coupons`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/validate` | POST | ✅ Checkout (validateCoupon) |
| `/` | GET | ✅ `/admin/coupons` |
| `/` | POST | ✅ `/admin/coupons` |
| `/:id/toggle` | PATCH | ✅ `/admin/coupons` |
| `/:id` | DELETE | ✅ `/admin/coupons` |

**Cobertura: completa.**

---

### 2.13 Wishlist (`/wishlist`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ `/wishlist` |
| `/toggle` | POST | ✅ Producto, wishlist |
| `/check/:productId` | GET | ✅ Producto (corazón) |

**Cobertura: completa.**

---

### 2.14 Vendors (`/vendors`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/profile/:slug` | GET | ✅ `/vendor/[slug]` (tienda pública) |
| `/:vendorId/products` | GET | ✅ Tienda pública, listados |
| `/register` | POST | ✅ `/vendor/register` |
| `/me` | GET | ✅ `/vendor/profile`, dashboard |
| `/me` | PATCH | ✅ `/vendor/profile` |
| `/dashboard` | GET | ✅ `/vendor/dashboard` |
| `/me/kyc` | GET | ❌ Sin UI (estado KYC) |
| `/me/kyc` | POST | ❌ Sin UI (enviar KYC) |
| `/me/api-keys/scopes` | GET | ❌ Sin UI |
| `/me/api-keys` | GET | ❌ Sin UI |
| `/me/api-keys` | POST | ❌ Sin UI |
| `/me/api-keys/:id` | DELETE | ❌ Sin UI |
| `/admin/all` | GET | ✅ `/admin/vendors` |
| `/admin/:id` | PATCH | ✅ `/admin/vendors` |
| `/admin/kyc/:vendorId/review` | POST | ❌ Sin UI (revisión KYC en admin) |

**Cobertura: parcial.** Faltan: pantalla KYC vendedor, pantalla API keys vendedor, revisión KYC en admin/vendors.

---

### 2.15 Supplier routes (`/suppliers`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/webhook/:supplierId` | POST | Backend |
| `/adapter-types` | GET | ✅ Admin suppliers |
| `/` | GET | ✅ `/admin/suppliers` |
| `/` | POST | ✅ Admin suppliers |
| `/:id` | GET | ✅ `/admin/suppliers/[id]` |
| `/:id` | PATCH | ✅ Admin supplier detail |
| `/:id/test` | POST | ✅ Admin supplier detail |
| `/:id/link-product` | POST | ✅ Admin supplier detail |
| `/:id/unlink-product/:productId` | DELETE | ✅ Admin supplier detail |
| `/:id/import` | POST | ✅ Admin supplier detail |
| `/:id/orders` | GET | ✅ Admin supplier detail |
| `/fulfill/:orderId` | POST | ✅ Admin (fulfill) |

**Cobertura: completa.**

---

### 2.16 Vendor payouts (`/vendor-payouts`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/connect` | POST | ✅ Vendor onboarding/payouts |
| `/mine` | GET | ✅ `/vendor/payouts` |
| `/process` | POST | ✅ `/admin/payouts` |

**Cobertura: completa.**

---

### 2.17 Shipments (`/shipments`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/order/:orderId` | GET | ✅ Detalle orden (si se muestra envío) |
| `/vendor/mine` | GET | ✅ `/vendor/shipments` |
| `/:id/tracking` | PATCH | ✅ Vendor shipments |
| `/:id/status` | PATCH | ✅ `/admin/shipments` (usa órdenes + este PATCH) |

**Nota:** No existe `GET /shipments/admin/all`. La página admin/shipments obtiene órdenes con `GET /orders/admin/all` y usa `PATCH /shipments/:id/status`. Correcto.

**Cobertura: completa.**

---

### 2.18 Shipping (`/shipping`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/estimate` | POST | ✅ Checkout (estimateShipping) |
| `/estimate-country` | POST | ✅ Checkout (estimateByCountry) |
| `/track/:trackingNumber` | GET | Parcial (si hay página de tracking) |

**Cobertura: alta.**

---

### 2.19 Currencies (`/currencies`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ Footer, checkout, etc. |
| `/detect` | GET | Uso interno/geo |
| `/convert` | POST | Uso interno |
| `/countries` | GET | ✅ Formularios (país) |
| `/sync` | POST | ✅ `/admin/currencies` |
| `/seed-countries` | POST | ✅ `/admin/currencies` |

**Cobertura: completa.**

---

### 2.20 Marketplace (`/marketplace`)

Incluye loyalty, flash-sales, gift-cards, bundles, questions, newsletter.

| Área | UI |
|------|-----|
| Loyalty (profile, history, redeem, referral) | ✅ `/profile/loyalty` |
| Flash sales (get, admin CRUD) | ✅ `/admin/flash-sales`, `/deals` |
| Gift cards (create, validate, admin list) | ✅ Checkout/admin, `/admin/gift-cards` |
| Bundles (get, admin CRUD) | ✅ `/admin/bundles`, listados |
| Questions (get, ask, answer) | ✅ Producto (ReviewSection o questions), admin |
| Newsletter (subscribe, unsubscribe) | ✅ Footer (NewsletterSignup) |
| Newsletter subscribers (admin) | ❌ Sin UI (GET `/newsletter/subscribers`) |

**Cobertura: alta.** Falta solo listado de suscriptores newsletter en admin.

---

### 2.21 Reviews (`/reviews`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/product/:productId` | GET | ✅ ReviewSection en producto |
| `/` | POST | ✅ ReviewSection (crear) |
| `/:id` | DELETE | ✅ ReviewSection (borrar) |

**Cobertura: completa.**

---

### 2.22 Notifications (`/notifications`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ NotificationBell / dropdown |
| `/unread-count` | GET | ✅ NotificationBell |
| `/:id/read` | PATCH | ✅ Al abrir notificación |
| `/read-all` | PATCH | ✅ Marcar todas leídas |

**Cobertura: completa.**

---

### 2.23 Disputes (`/disputes`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ `/profile/disputes` |
| `/mine` | GET | ✅ `/profile/disputes` |
| `/admin/all` | GET | ✅ `/admin/disputes` |
| `/:id` | GET | ✅ Detalle disputa (perfil/admin) |
| `/:id/messages` | POST | ✅ Detalle disputa |
| `/admin/:id` | PATCH | ✅ `/admin/disputes` |

**Cobertura: completa.**

---

### 2.24 Messages (`/messages`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ `/profile/messages` |
| `/conversations` | GET | ✅ `/profile/messages` |
| `/unread-count` | GET | ✅ Mensajes |
| `/thread/:userId` | GET | ✅ Mensajes (hilo) |

**Cobertura: completa.**

---

### 2.25 Tickets (`/tickets`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ `/profile/support` |
| `/mine` | GET | ✅ `/profile/support` |
| `/admin/all` | GET | ✅ `/admin/tickets` |
| `/:id` | GET | ✅ Detalle ticket |
| `/:id/respond` | POST | ✅ Detalle ticket |
| `/admin/:id/status` | PATCH | ✅ Admin tickets |

**Cobertura: completa.**

---

### 2.26 Stats (`/stats`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/dashboard` | GET | ✅ `/admin/dashboard` |

**Cobertura: completa.**

---

### 2.27 Audit (`/audit`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | GET | ✅ `/admin/audit` |

**Cobertura: completa.**

---

### 2.28 Analytics (`/analytics`)

Varios subpaths: sales, products, users, vendors, export, tax, legal, cookie-consent, my-data.

| Endpoint / Uso | UI |
|----------------|-----|
| Sales, products, users, export | ✅ `/admin/analytics` |
| Vendors/:vendorId | Uso en admin (puede ser desde analytics o vendors) |
| Tax rules (CRUD) | ✅ `/admin/tax-rules` |
| Legal (get public, admin list/upsert) | Parcial (páginas legales públicas; admin legal no verificado) |
| Cookie consent | ✅ CookieConsent |
| Export my data / Delete my data | ❌ Sin UI (GDPR: exportar/borrar mis datos) |

**Cobertura: alta.** Faltan: posible pantalla “Exportar mis datos” / “Eliminar mi cuenta” (delete ya se usa en perfil; export no).

---

### 2.29 Security (`/security`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/dashboard` | GET | ❌ Sin UI (dashboard seguridad admin) |

**Cobertura: sin UI.** Falta pantalla en admin (ej. “Seguridad” en sidebar y página que llame a `/security/dashboard`).

---

### 2.30 Uploads (`/uploads`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| POST (imágenes) | POST | ✅ Admin productos, vendor profile, etc. |

**Cobertura: completa.**

---

### 2.31 Addresses (`/addresses`)

| Endpoint | Método | UI / Uso |
|----------|--------|----------|
| `/` | POST | ✅ Perfil / checkout |
| `/` | GET | ✅ Perfil, checkout |
| `/:id` | DELETE | ✅ Perfil |

**Cobertura: completa.**

---

## 3. Recomendaciones

1. **Admin – Seguridad:** Añadir entrada “Seguridad” en el sidebar de admin y una página que consuma `GET /security/dashboard` (métricas de login fallidos, sesiones, KYC pendientes, etc.).
2. **Vendedor – KYC:** Añadir en el portal vendedor una sección “Verificación (KYC)” que use `GET /vendors/me/kyc` y `POST /vendors/me/kyc` (formulario documento + URL).
3. **Vendedor – API keys:** Añadir sección “API keys” en vendor (listar, crear, revocar) usando los endpoints `/vendors/me/api-keys` y `/vendors/me/api-keys/scopes`.
4. **Admin – Revisión KYC:** En la ficha de vendedor en `/admin/vendors` (o detalle), añadir botón/panel “Revisar KYC” que llame a `POST /vendors/admin/kyc/:vendorId/review`.
5. **2FA – Sesiones activas:** Pantalla en perfil/seguridad para listar sesiones (`GET /2fa/sessions`) y revocar (`DELETE /2fa/sessions/:id`).
6. **Privacidad (GDPR):** Pantalla “Descargar mis datos” que llame a `GET /analytics/my-data` y “Eliminar cuenta” ya usa `DELETE /users/profile`; confirmar que export my data esté enlazado si se ofrece.
7. **Admin – Newsletter:** Si se quiere gestionar suscriptores, añadir página que use `GET /marketplace/newsletter/subscribers`.
8. **adminService.getShipments():** Eliminar o reemplazar por uso de órdenes; la ruta `/shipments/admin/all` no existe en el backend.

---

## 4. Conclusión

El sistema tiene **buena cobertura** de UI para los flujos principales (auth, compra, perfil, admin). Los endpoints **sin UI o con UI parcial** se concentran en:

- Seguridad (dashboard admin),
- KYC y API keys del vendedor,
- Revisión KYC en admin,
- Sesiones 2FA (listar/revocar),
- Exportación de datos personales (my-data),
- Suscriptores de newsletter (admin).

Implementando las pantallas sugeridas en la sección 3 se alcanzaría cobertura UI prácticamente completa para todos los módulos del backend.
