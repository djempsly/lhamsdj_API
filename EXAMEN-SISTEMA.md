# Examen exhaustivo del sistema – LhamsDJ

**Fecha:** Febrero 2025  
**Alcance:** Backend (Express, Prisma), Frontend (Next.js), seguridad, tests, configuración y consistencia.

---

## 1. Resumen ejecutivo

| Área           | Estado general | Crítico |
|----------------|----------------|---------|
| Seguridad API  | Bueno con 1 brecha | **Sí** (CSRF no integrado en frontend) |
| Auth/Backend   | Bueno          | No |
| Frontend–API   | Inconsistencias | Sí (CSRF; cambio de contraseña 404) |
| Validación     | Bueno          | No |
| Tests          | Solo backend   | No |
| Config/Docs    | Aceptable      | No |

---

## 2. Seguridad

### 2.1 Lo que está bien

- **Sanitización**: Middleware global contra SQL y XSS en body/query/params; límite de body 10kb.
- **Rate limiting**: Público (200/min), privado (100/min), auth (20/15min), refresh, reset password, uploads.
- **Auth**: JWT + refresh en cookie, 2FA (TOTP), bloqueo por intentos, verificación por email.
- **CSRF (backend)**: Middleware `verifyCsrf` activo; GET `/api/v1/auth/csrf` expone token; exención para peticiones solo Bearer.
- **Webhooks**: Stripe con verificación de firma; supplier webhook con HMAC si `webhookSecret` está configurado.
- **Cabeceras**: Helmet, X-Frame-Options, nosniff, HSTS y CSP en producción.
- **CORS**: Orígenes configurables; header `X-Csrf-Token` permitido.
- **Secrets**: Logger redacta `authorization`, `cookie`, `password`, `newPassword`, `resetToken`.
- **Tokens**: Refresh hasheado (SHA256), JWT con expiración; en producción se exige `JWT_SECRET`.

### 2.2 Crítico: frontend no envía CSRF

- El backend exige **X-Csrf-Token** (y cookie `csrf-token`) en POST/PUT/PATCH/DELETE cuando hay cookie de sesión.
- En el frontend **no hay** ninguna referencia a `csrf`, `X-Csrf-Token` ni `csrfToken`.
- **Consecuencia**: Desde el navegador, **todas las mutaciones** (login, register, carrito, órdenes, etc.) reciben **403** en un entorno con CSRF activado.
- **Refresh**: `apiFetch` llama a `POST /auth/refresh` en 401; esa petición lleva cookies pero no CSRF → también 403 y el refresh automático falla.

**Recomendación:**

1. Al cargar la app (o antes del primer POST): `GET /api/v1/auth/csrf` y guardar `csrfToken` (por ejemplo en estado/ref en cliente).
2. En **todas** las peticiones que modifican estado (incluido `POST /auth/refresh` en `apiFetch`): añadir header `X-Csrf-Token: <token>`.
3. Usar el mismo agente/cookies (p. ej. `fetch` con `credentials: 'include'`) para que la cookie `csrf-token` se envíe en las mutaciones.

---

## 3. Autenticación y rutas

### 3.1 Backend

- Rutas protegidas usan `authenticate`; admin/soporte usan `requireAdmin` / `requireSupport`.
- Refresh token: cookie `refresh_token` con `path: '/api/v1/auth'` (solo se envía al API en ese path).
- Cookies de auth: `httpOnly`, `secure` en producción, `sameSite: 'lax'`.

### 3.2 Endpoint inexistente: cambio de contraseña (logueado)

- El frontend llama a **POST `/auth/change-password`** (`authService.changeUserPassword`).
- En el backend **no existe** esa ruta ni controller; solo existen `forgot-password` y `reset-password`.
- **Efecto**: La opción “cambiar contraseña” desde el perfil devuelve **404**.

**Recomendación:** Implementar en backend algo como `POST /api/v1/auth/change-password` (con `authenticate`) que reciba `currentPassword` y `newPassword`, valide la actual y actualice; y opcionalmente un endpoint bajo `/users` (ej. PATCH perfil con cambio de contraseña). Mantener el frontend alineado con la ruta elegida.

### 3.3 Frontend: rutas protegidas

- **Protegidas en middleware**: `/profile`, `/cart`, `/checkout`, `/payment`, `/admin`, `/auth` (solo login/register como “auth pages”).
- **No protegidas en middleware**: `/vendor/*` no está en `PROTECTED_ROUTES` ni en el matcher.
- **Efecto**: Cualquiera puede abrir `/vendor/dashboard`, etc.; el API devolverá 401 en endpoints que requieren auth, pero la UI de vendor es accesible sin login.

**Recomendación:** Incluir `/vendor` en rutas que exigen sesión (y en el matcher del middleware) o proteger por layout (redirect si no hay sesión).

---

## 4. Validación y errores

### 4.1 Zod

- Varios controllers usan `schema.parse(req.body)` y capturan `z.ZodError` para responder **400** (p. ej. order, audit, auth traduce mensajes).
- No todos los controllers que usan `.parse()` tienen un `catch` explícito de `ZodError`; si no, el error llega al `errorHandler` como **500**.
- **Recomendación:** Revisar todos los controllers que hacen `.parse()` y unificar: o bien `try/catch` con 400 para ZodError, o un middleware que transforme ZodError en 400.

### 4.2 Error handler global

- Gestiona `MulterError` (tamaño, número de archivos, campo inesperado) y devuelve 400 con mensajes i18n.
- Para 500 se devuelve mensaje genérico; se registra `requestId` en la respuesta (útil para soporte).
- CORS: si el origen no está permitido se llama a `callback(new Error(...))`; ese error puede acabar en el handler genérico (p. ej. 500). **Recomendación:** Devolver 403 de forma explícita para CORS en lugar de depender del error genérico.

---

## 5. Base de datos (Prisma)

- **Índices**: Hay índices en campos de búsqueda y filtrado (token, userId, status, slug, productId, orderId, etc.) y varios `@@unique` (userId+productId para wishlist, etc.).
- **Relaciones**: Schema coherente con roles, órdenes, pagos, envíos, disputas, vendors, suppliers, etc.
- **Recomendación:** Revisar consultas con listados (paginación) y relaciones anidadas para evitar N+1; usar `include`/`select` de forma explícita donde haga falta.

---

## 6. Subida de archivos

- Multer + S3; filtro por MIME (jpeg, png, webp); límite 5MB por archivo.
- Hay un **imageValidator** que comprueba magic bytes (no solo extensión/MIME).
- **uploadLimiter** (30 req/15 min) aplicado en rutas de upload.
- **Recomendación:** Confirmar que todas las rutas que suben imágenes pasan por el mismo middleware de validación (MIME + magic bytes) y que el `fileFilter` de multer no confía solo en el cliente.

---

## 7. Tests

- **Backend**: Jest; tests de validación (Zod), utilidades (paginación), middleware (sanitize), integración (health, auth protegida, validación login/forgot, seguridad: SQL, JWT, rate limit, payload, CSRF, path traversal).
- **Frontend**: No hay tests (ni Jest ni Vitest ni carpetas de test).
- **Recomendación:** Añadir al menos tests de integración o E2E para flujos críticos (login, checkout, cambio de contraseña cuando exista). En frontend, considerar Vitest + React Testing Library para componentes clave.

---

## 8. Configuración y documentación

- **PORT**: En `server.ts` el default es `process.env.PORT || 3001`; el README indica “por defecto 4000”. Si no se define `PORT` en `.env`, el servidor usa 3001.
- **Recomendación:** Unificar: o bien default 4000 en código, o bien documentar que el default es 3001 y que para 4000 hay que poner `PORT=4000` en `.env`.
- **Variables de entorno**: `validateEnv` exige en producción: JWT_SECRET, DATABASE_URL, Stripe, AWS, RESEND. En dev solo DATABASE_URL. Aviso si JWT_SECRET tiene menos de 32 caracteres.
- **Swagger**: Disponible en desarrollo en `/api-docs`.

---

## 9. Checklist de acciones prioritarias

| Prioridad | Acción |
|----------|--------|
| **P0** | Integrar CSRF en frontend: obtener token (GET `/auth/csrf`), enviar `X-Csrf-Token` en todas las mutaciones y en la llamada a `/auth/refresh` desde `apiFetch`. |
| **P0** | Implementar cambio de contraseña en backend (ej. `POST /auth/change-password`) y conectar el frontend a la ruta correcta. |
| **P1** | Proteger rutas `/vendor/*` en el middleware del frontend (o por layout). |
| **P1** | Revisar controllers que usan `.parse()` y unificar manejo de ZodError (400). |
| **P2** | Unificar documentación de PORT (README vs server.ts). |
| **P2** | CORS: responder 403 explícito cuando el origen no esté permitido. |
| **P2** | Añadir tests en frontend o E2E para flujos críticos. |

---

## 10. Conclusión

El sistema tiene una base sólida: auth con 2FA, rate limits, sanitización, CSRF en backend, webhooks firmados, buenos índices en Prisma y tests de seguridad en backend. Los dos puntos críticos son: **(1)** el frontend no envía el token CSRF, por lo que todas las mutaciones (y el refresh) reciben 403 con la configuración actual, y **(2)** el cambio de contraseña desde perfil apunta a un endpoint que no existe (404). Corregir CSRF en el cliente e implementar el endpoint de cambio de contraseña (y opcionalmente proteger `/vendor`) deja el sistema en buen estado para producción desde el punto de vista de este examen.
