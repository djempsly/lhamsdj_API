# Qué es CI/CD y para qué sirve

## Definición

- **CI (Continuous Integration – Integración continua):** automatizar la **verificación** del código cada vez que se hace push o pull request. Eso incluye: instalar dependencias, ejecutar tests, lint y build. Si algo falla, el equipo lo ve en seguida.
- **CD (Continuous Delivery / Deployment – Entrega o despliegue continuo):** automatizar la **entrega** del código a un entorno (staging o producción) después de que CI pase. “Delivery” = el artefacto está listo para desplegar; “Deployment” = se despliega sin paso manual.

En este proyecto tenemos **CI** en GitHub Actions; **CD** se puede añadir después (por ejemplo desplegar a Vercel/Railway cuando el branch `main` pase los tests).

## Para qué sirve

1. **Detectar errores pronto:** los tests se ejecutan en cada cambio; si rompes algo, el pipeline falla.
2. **No depender de “en mi máquina funciona”:** el código se prueba en un entorno limpio (Linux, Node 20).
3. **Desplegar con confianza:** si CI pasa, el código está probado y compilado; luego un paso de CD puede desplegarlo.
4. **Documentar cómo se construye y prueba el proyecto:** el workflow `.github/workflows/ci.yml` es la definición ejecutable.

## Qué hace nuestro pipeline (CI)

Archivo: `.github/workflows/ci.yml`

1. **Se dispara** en cada push o PR a `main` o `develop`.
2. **Job Backend:**
   - Instala dependencias (`npm ci`) en `backend/`.
   - Genera el cliente Prisma.
   - Ejecuta los tests (`npm run test`) con variables de entorno de test.
   - Ejecuta el build (`npm run build`).
3. **Job Frontend:**
   - Instala dependencias en `frontend/` con `--legacy-peer-deps`.
   - Ejecuta tests de frontend (`npm run test:run`).
   - Ejecuta build de Next.js (`npm run build`) con env de ejemplo.

Si algún paso falla, el workflow marca el check como fallido (en la PR o en el commit).

## Cómo añadir CD (ejemplo)

Para desplegar cuando CI pase (por ejemplo a Vercel o a un servidor):

- Añadir un job `deploy` que dependa de `backend` y `frontend`, y que:
  - use los secretos del repo (tokens de Vercel, Railway, etc.), y
  - ejecute el comando o acción de despliegue (p. ej. `vercel --prod`, o `rsync` a un servidor).

Así, **CI** = “¿el código está bien?” y **CD** = “subir el código que pasó CI al entorno elegido”.
