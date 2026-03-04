# Qué es N+1 y cómo lo evitamos

## ¿Qué significa N+1?

**N+1** es un patrón de consultas a base de datos que causa **muchas más queries de las necesarias**:

1. Se hace **1 query** que devuelve **N** registros (por ejemplo, 50 órdenes).
2. Para cada uno de esos N registros se hace **1 query más** para obtener datos relacionados (por ejemplo, los ítems de cada orden).
3. Total: **1 + N** queries (1 + 50 = 51 en el ejemplo).

### Ejemplo malo (N+1)

```ts
const orders = await prisma.order.findMany();           // 1 query
for (const order of orders) {
  const items = await prisma.orderItem.findMany({       // N queries (una por orden)
    where: { orderId: order.id },
  });
}
// Total: 1 + N queries
```

### Ejemplo bueno (una sola query con include)

```ts
const orders = await prisma.order.findMany({
  include: { orderItems: true },   // Prisma trae órdenes + ítems en 1 o 2 queries optimizadas
});
// Total: 1 o 2 queries (según el driver)
```

Prisma con `include`/`select` suele resolver las relaciones en **pocas queries** (a veces 2: una para la tabla principal y otra para las relaciones), no una por fila.

## Cómo lo aplicamos en este proyecto

- **Órdenes:** `OrderService.getMyOrders` y `getOrderById` usan `findMany`/`findUnique` con `include: { orderItems, address, shipments, coupon }` → no N+1.
- **Productos:** `ProductService.getBySlug` usa `findUnique` con `include: { category, images, variants, reviews }` → una sola query (o dos internas).
- **Categorías:** `CategoryService.getAll` usa `findMany` con `include: { children, _count }` → una sola query.
- **Carrito:** `CartService.getCart` usa `include` de ítems y producto/variante → una sola query.

Regla: al listar o obtener entidades con relaciones, **siempre usar `include` o `select`** en la primera llamada a Prisma y evitar bucles que hagan nuevas queries por cada fila.
