# Métricas y alertas

## Métricas (Prometheus)

El backend expone métricas en formato Prometheus en **GET /metrics**.

- **Uso:** Un scraper (Prometheus, Datadog, etc.) puede hacer `GET http://<api>/metrics` cada 15–60 s.
- **Contenido:**
  - Métricas por defecto de Node (`nodejs_*`: memoria, evento loop, etc.).
  - `http_requests_total`: contador de peticiones por `method`, `path`, `status`.
  - `http_request_duration_seconds`: histograma de duración por `method`, `path`.

El endpoint `/metrics` no tiene un rate limit más estricto que el resto de la API, para que el scraper no sea bloqueado.

## Health check para alertas

**GET /health** comprueba que la API y la base de datos responden:

- **200** → `{ "status": "ok", "db": "up" }` (todo bien).
- **503** → `{ "status": "degraded", "db": "down" }` (DB no disponible).

Se hace un `SELECT 1` contra la base de datos; si falla, se responde 503.

## Cómo configurar alertas

1. **Prometheus + Alertmanager**
   - Scrapear `GET /metrics` y, si quieres, un probe a `GET /health`.
   - Reglas de alerta: por ejemplo, si `up == 0` para el job de la API, o si `rate(http_requests_total{status=~"5.."}[5m])` es alto.
   - Alertmanager para notificaciones (email, Slack, PagerDuty).

2. **Monitor externo (UptimeRobot, Pingdom, etc.)**
   - Comprobar **GET /health** cada 1–5 minutos.
   - Alerta si el endpoint no responde o devuelve 503 (base de datos caída o API caída).

3. **Kubernetes / Docker**
   - Usar **GET /health** como liveness/readiness probe para reiniciar o dejar de enviar tráfico cuando la app esté degradada.
