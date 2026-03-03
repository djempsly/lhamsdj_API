# Examen exhaustivo del sistema – LhamsDJ

**Fecha:** Marzo 2026  
**Alcance:** Backend (Express, Prisma), Frontend (Next.js), seguridad, tests, configuración y consistencia.

---

## 1. Resumen ejecutivo

| Área           | Estado | Notas |
|----------------|--------|-------|
| Seguridad API  | **Completo** | CSRF, sanitización, rate limit, Helmet, JWT, 2FA |
| Auth/Backend   | **Completo** | Login, register, refresh, cambio de contraseña, 2FA, bloqueo |
| Frontend–API   | **Completo** | CSRF integrado en apiFetch y authService |
| Validación     | **Completo** | Zod + errorHandler unificado |
| Tests Backend  | **Completo** | 17 suites, 112 tests |
| Tests Frontend | **Completo** | 2 suites, 7 tests (Vitest) |
| Config/Docs    | **Completo** | PORT unificado, README actualizado |

---

## 2. Correcciones aplicadas

### P0 – Crítico (resuelto)

#### 2.1 CSRF integrado en frontend
- Nuevo módulo `frontend/src/lib/csrf.ts`: obtiene y cachea el token CSRF desde `GET /api/v1/auth/csrf`.
- `apiFetch.ts`: inyecta automáticamente `X-Csrf-Token` en POST/PUT/PATCH/DELETE; limpia caché si el server devuelve 403 por CSRF; el refresh también lleva CSRF.
- `authService.ts`: todas las funciones de mutación (login, register, verify2FA, forgotPassword, resetPassword, verifyByCode, refreshSession, logout, logoutAll, changeUserPassword) envían el header CSRF.
- Tests Vitest: `csrf.test.ts` (4 tests), `apiFetch.test.ts` (3 tests).

#### 2.2 Endpoint de cambio de contraseña
- **Schema**: `changePasswordSchema` en `validation/authSchema.ts` (currentPassword requerido, newPassword con política fuerte).
- **Service**: `AuthService.changePassword(userId, currentPassword, newPassword)` verifica la contraseña actual con bcrypt y actualiza con hash bcrypt 12 rounds.
- **Controller**: `changePassword` en `authController.ts`, valida con Zod, devuelve 401 si la contraseña actual es incorrecta, limpia cookies al cambiar.
- **Ruta**: `POST /api/v1/auth/change-password` con `authenticate` middleware.
- **i18n**: `auth.wrongCurrentPassword` en EN/ES/FR.
- **Tests**: schema validation (5 tests), integración (sin auth → 401).

### P1 – Importante (resuelto)

#### 2.3 Rutas `/vendor` protegidas en frontend
- `middleware.ts`: `/vendor` añadido a `PROTECTED_ROUTES` y al `matcher` de Next.js.
- Sin sesión (`access_token`) → redirect a `/auth/login?redirect=/vendor/...`.

#### 2.4 Manejo unificado de ZodError
- `errorMiddleware.ts`: detecta `ZodError` y responde **400** con el primer mensaje del issue.
- CORS con origen no permitido: responde **403** "Origin not allowed" (antes era 500 genérico).
- ZodError se registra como `warn` (no `error`), para no disparar alertas innecesarias.

### P2 – Otros (resuelto)

#### 2.5 PORT unificado
- `server.ts`: default cambiado de `3001` a `4000` para coincidir con el README.

#### 2.6 CORS 403 explícito
- `errorMiddleware.ts`: errores con mensaje que contiene `CORS` devuelven 403 en lugar de 500.

#### 2.7 Tests frontend
- Vitest + jsdom configurados: `vitest.config.ts`, `src/__tests__/setup.ts`.
- `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom` como devDependencies.
- Scripts: `npm test` (watch), `npm run test:run` (CI).
- Tests: `csrf.test.ts` y `apiFetch.test.ts`.

---

## 3. Inventario de seguridad (estado final)

| Capa | Medida | Implementación |
|------|--------|----------------|
| **Entrada** | Sanitización SQL/XSS | `sanitizeMiddleware` global |
| **Entrada** | Límite body | `express.json({ limit: '10kb' })` |
| **Entrada** | Validación | Zod schemas + errorHandler fallback |
| **Auth** | JWT access | 1h expiración, cookie httpOnly |
| **Auth** | Refresh | Hash SHA256, 7 días, revocable |
| **Auth** | 2FA | TOTP (otplib) |
| **Auth** | Bloqueo | 5 intentos → 30 min lock |
| **Auth** | Cambio contraseña | Verifica actual, política fuerte |
| **Auth** | Email verificación | Token + código 6 dígitos |
| **CSRF** | Backend | `verifyCsrf` global en router; exención Bearer |
| **CSRF** | Frontend | `csrf.ts` + `apiFetch` + `authService` |
| **Rate limit** | Público | 200 req/min |
| **Rate limit** | Privado | 100 req/min |
| **Rate limit** | Auth | 20 req/15min |
| **Rate limit** | Reset password | 5 req/hora |
| **Rate limit** | Uploads | 30 req/15min |
| **Cabeceras** | Helmet | X-Content-Type, X-Frame, Referrer, Permissions |
| **Cabeceras** | Producción | HSTS, CSP estricta |
| **CORS** | Configurado | Orígenes explícitos, X-Csrf-Token permitido |
| **Uploads** | Validación | MIME filter + magic bytes + 5MB limit |
| **Webhooks** | Stripe | Firma verificada |
| **Webhooks** | Supplier | HMAC SHA256 |
| **Logging** | Redacción | password, cookie, authorization, resetToken |
| **Env** | Validación | Variables obligatorias según NODE_ENV |

---

## 4. Tests (estado final)

### Backend (Jest + Supertest)

| Suite | Tests | Tipo |
|-------|-------|------|
| authSchema | 15 | Validación |
| orderSchema | 6 | Validación |
| cartSchema | 4 | Validación |
| addressSchema | 5 | Validación |
| categorySchema | 4 | Validación |
| reviewSchema | 6 | Validación |
| productSchema | 8 | Validación |
| variantSchema | 6 | Validación |
| paymentSchema | 5 | Validación |
| userSchema | 6 | Validación |
| adminSchema | 10 | Validación |
| pagination | 4 | Utilidad |
| sanitizeMiddleware | 3 | Middleware |
| health | 1 | Integración |
| authProtected | 4 | Integración |
| authValidation | 5 | Integración |
| securityAttacks | 10 | Seguridad |
| **Total** | **112** | |

### Frontend (Vitest + jsdom)

| Suite | Tests | Tipo |
|-------|-------|------|
| csrf | 4 | Unit |
| apiFetch | 3 | Unit |
| **Total** | **7** | |

---

## 5. Checklist final

| Item | Estado |
|------|--------|
| CSRF backend activo | ✅ |
| CSRF frontend integrado | ✅ |
| Cambio de contraseña (backend + frontend) | ✅ |
| Rutas /vendor protegidas | ✅ |
| ZodError → 400 unificado | ✅ |
| CORS → 403 explícito | ✅ |
| PORT unificado (4000) | ✅ |
| Tests frontend (Vitest) | ✅ |
| 112 tests backend pasando | ✅ |
| 7 tests frontend pasando | ✅ |
