h# LhamsDJ – Marketplace

Marketplace tipo e-commerce con roles de comprador, vendedor y administrador. Incluye catálogo, carrito, checkout, pagos (Stripe/PayPal), vendors, dropshipping, disputas, soporte, loyalty, i18n (EN/FR/ES) y panel admin.

## Stack

| Capa      | Tecnología |
|-----------|------------|
| Frontend  | Next.js 16, React 19, Tailwind, next-intl |
| Backend   | Express 5, Prisma, PostgreSQL |
| Pagos     | Stripe, PayPal |
| Auth      | JWT, refresh tokens, 2FA (TOTP), verificación por email |
| Despliegue | Docker Compose |

## Estructura del proyecto

```
lhamsDJ/
├── backend/          # API Express
│   ├── prisma/       # Schema y migraciones
│   ├── src/
│   │   ├── __tests__/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── frontend/         # Next.js (App Router)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── messages/ # i18n (en, fr, es)
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (o usar solo Docker)
- npm o pnpm

## Ejecución en local

### 1. Base de datos

Con PostgreSQL instalado localmente:

```bash
# Crear base de datos
createdb ecommerce_db
```

O levantar solo Postgres con Docker:

```bash
docker compose up postgres -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # o crear .env con las variables abajo
npm install
npx prisma generate
npx prisma migrate deploy   # o migrate dev en desarrollo
npm run dev
```

Por defecto el API corre en **http://localhost:4000** (o el `PORT` de tu `.env`).

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # si existe; si no, crear .env.local
npm install
npm run dev
```

El sitio corre en **http://localhost:3000**.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL de PostgreSQL (`postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | Sí (prod) | Secreto para JWT (≥ 32 caracteres en producción) |
| `PORT` | No | Puerto del API (por defecto 4000 o 3001 según código) |
| `ALLOWED_ORIGINS` | No | Orígenes CORS separados por coma (ej. `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Prod | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Prod | Secreto del webhook de Stripe |
| `RESEND_API_KEY` | Prod | API key de Resend (emails) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`, `CLOUDFRONT_URL` | Prod | Subida de archivos (S3/CloudFront) |

### Frontend (`frontend/.env.local`)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del API (ej. `http://localhost:4000/api/v1`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Client ID de PayPal (opcional) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clave de Cloudflare Turnstile (opcional) |

## Scripts útiles

### Backend

```bash
cd backend
npm run dev          # Desarrollo
npm run build        # Compilar TypeScript
npm start            # Producción (node dist/server.js)
npm run test         # Tests (Jest)
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura
npx prisma studio    # UI para la base de datos
npx prisma migrate dev   # Crear y aplicar migraciones en dev
npx prisma db seed   # Ejecutar seed
```

### Frontend

```bash
cd frontend
npm run dev    # Desarrollo
npm run build  # Build de producción
npm start      # Servir build
npm run lint   # Linter
```

## Tests (backend)

Los tests usan **Jest** y **Supertest**.

- **Unitarios**: validación (Zod), reglas de negocio sin DB.
- **Integración**: health check (`GET /`) sin depender de DB real (usa `DATABASE_URL` de test en el setup).

Ejecutar:

```bash
cd backend
npm run test
```

Para no conectar a una base real, en el setup de Jest se define `DATABASE_URL` a una URL de test si no existe. Para tests que sí usen DB (futuros), se puede usar una base de pruebas o Prisma con una DB en memoria/containers.

## Docker

Levantar todo el stack (Postgres + backend + frontend):

```bash
docker compose up --build
```

Más detalles en [README-DOCKER.md](./README-DOCKER.md).

| Servicio  | URL (por defecto)   |
|-----------|----------------------|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:4000 |
| PostgreSQL | localhost:5432      |

## Documentación del API

Con el backend en marcha (y fuera de producción), la documentación Swagger está en:

- **http://localhost:4000/api-docs**  
  (o el host/puerto donde corra el backend)

## Licencia

MIT.
