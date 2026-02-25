# Análisis de seguridad, funcionamiento y escalabilidad – LhamsDJ

**Enfoque:** Senior Software Engineer + Experto en Ciberseguridad  
**Objetivo:** Proyecto pensado como marketplace tipo Amazon / eBay / Temu

---

## 1. SEGURIDAD

### 1.1 Lo que está bien

| Área | Detalle |
|------|--------|
| **Autenticación** | JWT, bcrypt (cost 10), contraseñas nunca devueltas en respuestas. |
| **Recuperación de contraseña** | Código de 6 dígitos, hasheado con bcrypt, expiración 15 min, respuesta genérica si el email no existe. |
| **Autorización** | Middleware `authenticate` + `requireAdmin`. Órdenes y direcciones comprueban `userId`. |
| **IDOR** | OrderService.getOrderById y createPaymentIntent validan que la orden sea del usuario. |
| **Pagos** | Webhook de Stripe con `constructEvent` (firma). Body raw solo en ruta de webhook. |
| **Subida de archivos** | Solo admin, filtro por MIME (jpeg, png, webp), límite 5MB, nombres con UUID. |
| **CORS** | Orígenes explícitos (no `*`), `credentials: true` coherente con uso de cookies/token. |
| **Headers** | Helmet (con CSP desactivada para API), nocache, X-Frame-Options DENY. |
| **Rate limiting** | 100 req / 15 min por IP (global). |
| **Base de datos** | Prisma ORM: parametrizado, sin concatenación SQL → reduce riesgo de inyección. |
| **Validación** | Zod en auth, orders, cart, address, product, category, review. |

### 1.2 Crítico – Corregir ya

| # | Problema | Ubicación | Riesgo |
|---|----------|-----------|--------|
| 1 | **Token JWT nunca se envía al backend** | Frontend: todos los `fetch` a rutas protegidas (cart, orders, profile, payments, addresses, admin) usan `credentials: "include"` pero **el backend no setea cookies** y **el frontend no guarda ni envía el token** en `Authorization: Bearer`. Tras login, las llamadas a `/cart`, `/orders`, `/users/profile`, etc. reciben **401**. | **Autenticación rota** para todo lo que requiere login. |
| 2 | **Secrets con fallback en código** | `authService.ts`: `JWT_SECRET \|\| 'secret_key'`. `paymentService.ts`: `STRIPE_SECRET_KEY \|\| 'sk_test_placeholder'`. En producción, si falta la variable, se usan valores por defecto y se pueden comprometer claves. | **Pérdida de confidencialidad** y validez de JWTs/pagos. |
| 3 | **Webhook sin validar env** | `paymentService.handleWebhook` usa `process.env.STRIPE_WEBHOOK_SECRET!`. Si no está definido, el webhook falla o puede comportarse de forma insegura. Debe **fallar al arranque** si falta. | Errores silenciosos o posibles bypass si no se maneja bien. |

### 1.3 Alto – Corregir pronto

| # | Problema | Ubicación | Recomendación |
|---|----------|-----------|----------------|
| 4 | **CORS: log de origen en consola** | `app.ts`: `console.log('Origen detectado:', origin)`. En producción expone datos y puede llenar logs. | Quitar en producción o usar nivel de log condicional. |
| 5 | **Stack trace en respuesta JSON** | `errorMiddleware.ts`: se envía `stack` en el JSON. En producción suele ser `null`, pero el campo existe. | No incluir `stack` en respuestas al cliente en producción. |
| 6 | **Actualización de perfil sin validar unicidad de email** | `userService.updateProfile`: si el usuario cambia `email` a uno ya usado por otro, Prisma puede lanzar error de unique o sobrescribir lógica de negocio. | Validar unicidad de email (excluyendo el usuario actual) antes de `update`. |
| 7 | **Ruta de upload: `folder` desde `req.body`** | `uploadMiddleware.ts`: `folder = req.body.folder \|\| 'products'`. Un admin malicioso o un bug podría inyectar rutas como `../../` (según cómo se use). | Lista blanca de carpetas (ej. `products`, `avatars`) y validar. |
| 8 | **`initiatePayment`: `orderId` sin validar** | `paymentController.ts`: `orderId` viene de `req.body` sin Zod. Aunque el servicio comprueba `order.userId === userId`, conviene validar tipo y rango. | Añadir schema Zod (ej. `z.number().int().positive()`) para `orderId`. |

### 1.4 Medio – Mejoras recomendadas

- **Auth:** Unificar códigos HTTP: “Credenciales inválidas” → 401 (no 400). Errores de validación Zod → 400.
- **JWT:** Considerar refresh tokens y blacklist/whitelist para logout y revocación si el producto crece.
- **Admin:** Evitar que un admin se desactive a sí mismo (comprobar `req.user.id !== targetId` en toggle de estado).
- **Logs:** No loguear cuerpos de peticiones con contraseñas ni tokens; no loguear emails completos en producción (anonimizar si hace falta).

---

## 2. FUNCIONAMIENTO Y LÓGICA DE NEGOCIO

### 2.1 Lo que está bien

- Creación de órdenes en **transacción**: crear orden, descontar stock, vaciar carrito de forma atómica.
- Validación de stock antes y durante la transacción.
- Direcciones: solo se pueden borrar si no tienen órdenes asociadas.
- Carrito: cantidad y existencia validadas con Zod y en servicio.

### 2.2 Bugs o incoherencias

| # | Problema | Ubicación | Efecto |
|---|----------|-----------|--------|
| 1 | **Dos rutas DELETE para la misma ruta** | `addressRoutes.ts`: `router.delete('/:id', authenticate, deleteAddress)` y después `router.delete('/:id', authenticate, requireAdmin, deleteAddress)`. En Express solo suele contar la última registrada. | Comportamiento confuso: puede que solo se use la segunda (solo admin puede borrar). Si la intención es que el usuario borre sus propias direcciones, la segunda ruta lo impide. |
| 2 | **UserService.toggleUserStatus** | El primer parámetro es el ID del usuario a modificar, pero el nombre del parámetro es `userId`. En el controlador se pasa `Number(id)` (id de la URL). | Funciona, pero el nombre es engañoso (parece “usuario actual” en vez de “usuario objetivo”). |
| 3 | **Frontend: Home** | Duplicación de listas (bestSellers + productsItem en el mismo grid) y sección “Novedades” con contenido incompleto (`<div key={product.id}>...</div>`). | UX confusa y sección rota. |

---

## 3. ESCALABILIDAD (marketplace grande)

### 3.1 Limitaciones actuales

| Área | Estado actual | Para tipo Amazon/eBay/Temu |
|------|----------------|----------------------------|
| **Listado de productos** | `ProductService.getAll()` sin paginación; devuelve todos los productos activos. | Necesario **paginación** (offset/limit o cursor) y **filtros** (categoría, precio, búsqueda). |
| **Rate limit** | 100 req/15 min **global** por IP. | Endpoints públicos (listar productos, ver detalle) deberían tener límites más altos o separados; login/register más estrictos. |
| **Conexiones DB** | Una instancia de Prisma por proceso; en dev se reutiliza con `global.prisma`. | En producción con múltiples instancias: connection pooling (PgBouncer o Prisma Accelerate) y límite de conexiones. |
| **Caché** | No hay caché (Redis/Memcached) para listados, sesiones o conteos. | Caché de catálogo, contadores, y opcionalmente sesiones para reducir carga en DB. |
| **Webhooks / jobs** | Webhook de Stripe se procesa en la misma petición. | Para alto volumen: cola (SQS, Bull, etc.) y worker que actualice órdenes; reintentos y idempotencia. |
| **Búsqueda** | No hay búsqueda full-text. | Índices full-text (PostgreSQL) o motor de búsqueda (Elasticsearch/OpenSearch) para productos. |
| **Archivos** | S3 está bien para almacenamiento. | CDN (CloudFront, etc.) delante de S3 para imágenes y assets. |
| **Sesiones/JWT** | JWT stateless en memoria/localStorage (cuando se implemente bien). | Para revocación y “cerrar sesión en todos los dispositivos”: blacklist de tokens o sesiones en Redis. |

### 3.2 Recomendaciones de arquitectura

- **API:** Mantener stateless; no depender de memoria local del proceso.
- **DB:** Índices en `slug`, `categoryId`, `userId`, `orderId`, fechas de orden; réplicas de lectura si crece el tráfico.
- **Pagos:** Idempotencia en webhook (comprobar si la orden ya está PAID antes de actualizar).
- **Monitoreo:** Métricas, logs estructurados y alertas (errores 5xx, latencia, tasa de fallos de pago).

---

## 4. INTEGRACIÓN

### 4.1 Lo que está bien

- **Stripe:** Payment Intent + webhook con firma; `paymentId` guardado en la orden.
- **Resend:** Envío de código de recuperación; manejo de errores sin revelar si el email existe.
- **S3:** Subida con multer-s3; contenido y tamaño controlados.
- **Frontend:** Uso de `NEXT_PUBLIC_*` para URLs y keys públicas; servicios separados por dominio.

### 4.2 Gaps

- **Frontend–Backend auth:** El flujo de token no está cerrado (ver 1.2 #1). Hay que definir: o bien **cookie HttpOnly** (backend setea cookie en login y el front solo usa `credentials: 'include'`), o bien **Bearer en header** (frontend guarda token en memoria o storage y lo envía en cada request).
- **PayPal:** Referencias en front (PayPalScriptProvider, create-order, capture-order) pero no se revisaron rutas equivalentes en backend; confirmar que existan y estén protegidas.
- **Turnstile (captcha):** Usado en registro; verificar que el backend valide el token con Cloudflare y rechace requests sin token válido.

---

## 5. RESUMEN EJECUTIVO

| Categoría | Valoración | Comentario |
|-----------|------------|------------|
| **Seguridad (diseño)** | Bien | Auth, IDOR, pagos, uploads y validación bien planteados. |
| **Seguridad (implementación)** | Crítico 1 punto | Token no enviado desde frontend rompe toda la auth. Secrets con fallback inaceptable en producción. |
| **Funcionamiento** | Aceptable | Lógica de órdenes y carrito sólida; bugs en rutas de direcciones y en home del frontend. |
| **Escalabilidad** | Insuficiente para “gran marketplace” | Sin paginación, sin caché, rate limit muy global; base buena para crecer con los cambios indicados. |
| **Integración** | Parcial | Stripe/Resend/S3 bien; flujo auth front–back por cerrar; PayPal y captcha por verificar en backend. |

**Prioridad inmediata:**  
1) Implementar envío de JWT (o cookie de sesión) desde el frontend y validación en backend.  
2) Eliminar fallbacks de `JWT_SECRET` y `STRIPE_SECRET_KEY`; exigir variables de entorno en producción.  
3) Corregir rutas duplicadas de `DELETE` en addresses y definir bien quién puede borrar (usuario vs admin).

Con eso se corrige la parte más crítica (auth y secretos) y se deja el proyecto en mejor estado para seguir creciendo hacia un marketplace escalable y seguro.
