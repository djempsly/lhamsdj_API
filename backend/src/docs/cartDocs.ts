/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Gestión del carrito de compras del usuario
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Obtener mi carrito de compras
 *     description: Retorna el carrito del usuario autenticado junto con los productos e imágenes. Si no existe, se crea uno vacío automáticamente.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           product:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     url:
 *                                       type: string
 */

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Agregar un producto al carrito
 *     description: Agrega un item o suma la cantidad si ya existe.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               productVariantId:
 *                 type: integer
 *                 description: Opcional, si el producto tiene tallas/colores
 *                 example: null
 *     responses:
 *       201:
 *         description: Producto agregado al carrito
 *       400:
 *         description: Error de validación o producto no encontrado
 */

/**
 * @swagger
 * /cart/items/{itemId}:
 *   patch:
 *     summary: Actualizar la cantidad de un item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del item del carrito (NO el ID del producto)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       404:
 *         description: Item no encontrado
 * 
 *   delete:
 *     summary: Eliminar un item específico del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item eliminado correctamente
 */

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Vaciar el carrito completo
 *     description: Elimina todos los items del carrito del usuario.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado correctamente
 */