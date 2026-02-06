/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestión de pedidos (Checkout)
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una orden (Checkout)
 *     description: Convierte el contenido del carrito en una orden final. Requiere una dirección válida.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: integer
 *                 description: ID de la dirección de envío creada previamente
 *                 example: 1
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Error de validación, carrito vacío o sin stock
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener mis pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de pedidos
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Ver detalle de un pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del pedido
 *       404:
 *         description: No encontrado
 */