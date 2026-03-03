# Auditoría: Seguridad, escalabilidad y funcionalidad

**Rol:** Senior Fullstack Engineer + Cybersecurity Expert  
**Fecha:** Marzo 2026  
**Alcance:** Backend (Express, Prisma), frontend (Next.js), APIs, uploads, auth.

---

## 1. Resumen ejecutivo

| Área | Estado previo | Acciones realizadas |
|------|----------------|---------------------|
| **IDOR** | 2 vulnerabilidades (shipments, dispute messages) | Corregidas con verificación de ownership/participante |
| **Upload** | Folder en S3 desde `req.body`, múltiples sin validación extensión | Allowlist de carpetas, extensión en múltiples |
| **Secrets** | JWT fallback en dev | JWT_SECRET obligatorio; tests con valor en setup |
| **Paginación** | sort por query sin allowlist | Allowlist por defecto; sort inseguro → defaultSort |
| **DB** | Address sin índice por userId | `@@index([userId])` en schema |
| **Disputes** | Cualquier usuario podía añadir mensaje a cualquier disputa | Solo owner, vendor de la disputa o staff |

---

## 2. Hallazgos de seguridad (y correcciones)

### 2.1 Crítico / Alto – Corregidos

#### IDOR: GET /shipments/order/:orderId
- **Riesgo:** Cualquier usuario autenticado podía pedir envíos de cualquier orden (orden de otro usuario).
- **Corrección:** En `shipmentController.getOrderShipments` se obtiene la orden por `orderId`, se comprueba `order.userId === req.user.id` y se responde 404 si no existe o 403 si no es el dueño. Solo después se llama a `ShipmentService.getByOrder(orderId)`.

#### IDOR: POST /disputes/:id/messages
- **Riesgo:** Cualquier usuario podía añadir mensajes a cualquier disputa.
- **Corrección:** `DisputeService.addMessage` ahora recibe `isStaff`. Se comprueba que el usuario sea el dueño de la disputa (`dispute.userId`), el vendor de la disputa (`dispute.vendor.userId`) o staff (ADMIN/SUPPORT). Si no, se lanza `FORBIDDEN` y el controller responde 403.

#### S3: path traversal en key (folder)
- **Riesgo:** `req.body.folder` se usaba directo en la key de S3; un atacante podía subir a rutas arbitrarias (ej. `../../../admin`).
- **Corrección:** Allowlist `['products', 'profiles']`. Función `getAllowedFolder(input)` que solo acepta esos valores; cualquier otro se mapea a `'products'`. La extensión del archivo también se valida contra una lista permitida (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).

#### JWT_SECRET
- **Riesgo:** Fallback `'dev_fallback_only'` cuando no había `JWT_SECRET` (incluido en algunos entornos).
- **Corrección:** Se exige `JWT_SECRET` definido y no vacío; si no, se lanza al cargar el módulo. En `__tests__/setup.ts` se define `JWT_SECRET` para que los tests sigan pasando.

#### Upload múltiple sin validación de extensión
- **Riesgo:** La ruta `POST /uploads` (array de imágenes) no pasaba por `validateImageExtension`; solo la subida simple lo hacía.
- **Corrección:** Se añade `validateImageExtension` en la ruta de múltiples uploads (después de `upload.array(...)`).

### 2.2 Medio – Corregidos

#### Paginación: sort por query
- **Riesgo:** `sort` llegaba directo a Prisma `orderBy`; claves inválidas o sensibles podían causar errores o comportamientos no deseados.
- **Corrección:** `parsePagination` acepta un tercer parámetro opcional `allowedSortFields`. Por defecto se usa `['createdAt', 'updatedAt', 'id']`. Si el `sort` del query no está en la lista, se usa `defaultSort`. Los servicios que necesiten más campos pueden pasar su propia lista permitida.

#### Índice en Address
- **Riesgo:** Consultas por `userId` en direcciones sin índice (listados, borrado).
- **Corrección:** En `schema.prisma` se añade `@@index([userId])` al modelo `Address`.

### 2.3 Medio – Recomendaciones (no implementadas en este cambio)

- **Helmet:** Reactivar y ajustar CSP/COEP/COOP/CORP en producción según el frontend.
- **Magic bytes en uploads con S3:** Con `multer-s3` no hay buffer en memoria; para validar magic bytes haría falta bufferizar un prefijo del stream o validar en otro proceso (p. ej. Lambda). MIME + extensión allowlist + carpeta allowlist siguen siendo la defensa actual.
- **Rate limit por usuario:** Además del límite por IP, valorar límites por `req.user?.id` en login/cambio de contraseña para mitigar intentos distribuidos desde muchas IPs.
- **Caché:** Categorías y monedas/países son buenos candidatos a caché (in-memory o Redis) con TTL e invalidación en escrituras.

### 2.4 Bajo / Info

- **Logout sin auth:** POST /logout no exige token; solo limpia cookies. Aceptable para “cerrar sesión en este navegador”.
- **Consistencia 404 vs 400:** Unificar “recurso no encontrado” → 404 y “validación/regla de negocio” → 400 en todos los endpoints.
- **Idempotencia en creación de órdenes:** Valorar idempotency key (ej. header o body) para evitar órdenes duplicadas por doble submit.

---

## 3. Escalabilidad

- **N+1:** No se detectaron patrones N+1; los listados usan `include`/`select` en una sola llamada a Prisma.
- **Índices:** Address ya tiene `@@index([userId])`; el resto de modelos revisados tenían índices adecuados.
- **Conexión Prisma:** Singleton con `global` en dev (HMR). En serverless, no usar `global` en producción para no reutilizar cliente entre invocaciones.
- **Rate limit:** Por IP (express-rate-limit). Para más resiliencia ante tráfico distribuido, considerar límites por usuario cuando exista sesión.

---

## 4. Funcionalidad

- **Manejo de errores:** El handler global trata ZodError, CORS, Multer y 500. Los controllers que usan `async` y no capturan rechazos dependen de que Express (o un wrapper) pase el error al handler.
- **Paginación:** Límites y página están acotados; `sort` restringido por allowlist.
- **API:** Forma de respuesta y códigos de estado son en general coherentes; se recomienda documentar y unificar 404/400 como arriba.

---

## 5. Archivos modificados (resumen)

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/shipmentController.ts` | Verificación de ownership de la orden antes de devolver envíos |
| `backend/src/controllers/disputeController.ts` | Pasa `isStaff` a `addMessage`; 403 en FORBIDDEN |
| `backend/src/services/disputeService.ts` | `addMessage` verifica owner/vendor/staff antes de crear mensaje |
| `backend/src/middleware/uploadMiddleware.ts` | Allowlist de carpetas S3 y extensión segura en key |
| `backend/src/routes/uploadRoutes.ts` | `validateImageExtension` en ruta de múltiples imágenes |
| `backend/src/utils/tokens.ts` | JWT_SECRET obligatorio (sin fallback) |
| `backend/src/utils/pagination.ts` | Allowlist de `sort` (tercer parámetro opcional) |
| `backend/src/__tests__/setup.ts` | `JWT_SECRET` definido para tests |
| `backend/prisma/schema.prisma` | `@@index([userId])` en modelo Address |

---

## 6. Próximos pasos sugeridos

1. Ejecutar `npx prisma migrate dev` (o `migrate deploy`) para aplicar el índice en `Address`.
2. Revisar cada uso de `parsePagination` y, donde haga falta, pasar la lista de `sort` permitida (ej. órdenes: `['createdAt', 'updatedAt', 'status', 'total']`).
3. Activar y afinar CSP/Helmet en producción.
4. Valorar caché para categorías y datos de monedas/países.
5. Ejecutar `npm audit` y actualizar dependencias con vulnerabilidades conocidas.
