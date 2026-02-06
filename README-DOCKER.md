# 🐳 Docker Setup - LhamsDJ

## Estructura de archivos

Coloca los archivos así en tu proyecto:

```
lhamsDJ/
├── docker-compose.yml        ← (raíz del proyecto)
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── prisma/
│   └── src/
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    └── src/
```

## Requisitos

1. Instalar Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Verificar instalación:
   ```bash
   docker --version
   docker compose version
   ```

## Cómo usar

### 1. Levantar todo (primera vez)
```bash
cd lhamsDJ
docker compose up --build
```

### 2. Levantar en segundo plano
```bash
docker compose up --build -d
```

### 3. Ver logs
```bash
docker compose logs -f           # todos los servicios
docker compose logs -f backend   # solo backend
docker compose logs -f frontend  # solo frontend
```

### 4. Detener todo
```bash
docker compose down
```

### 5. Detener y borrar datos de la BD
```bash
docker compose down -v
```

## URLs

| Servicio   | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:3000   |
| Backend    | http://localhost:3001   |
| PostgreSQL | localhost:5432         |

## Variables de entorno

Edita el `docker-compose.yml` para agregar tus variables reales:
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- Cualquier otra que necesite tu proyecto

## Nota importante

Antes de dockerizar, asegúrate de que tu backend tenga un script `build`
en el `package.json`:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js",
  "dev": "ts-node src/server.ts"
}
```

Si no lo tienes, agrégalo antes de correr `docker compose up --build`.
