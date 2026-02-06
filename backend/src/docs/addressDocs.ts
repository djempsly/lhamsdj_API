/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Gestión de direcciones de envío
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Obtener mis direcciones
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones
 * 
 *   post:
 *     summary: Crear una nueva dirección
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - postalCode
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Dirección creada
 */

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Eliminar una dirección
 *     tags: [Addresses]
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
 *         description: Dirección eliminada
 */