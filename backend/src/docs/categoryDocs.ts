/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías de productos
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna una lista jerárquica (padres e hijos) de todas las categorías.
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     summary: Obtener categoría por Slug
 *     description: Busca una categoría específica usando su URL amigable (slug).
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: El slug de la categoría (ej. ropa-de-hombre)
 *     responses:
 *       200:
 *         description: Detalles de la categoría
 *       404:
 *         description: Categoría no encontrada
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     description: Solo administradores. Crea una categoría principal o una subcategoría.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electrónica"
 *               description:
 *                 type: string
 *                 example: "Gadgets y dispositivos"
 *               image:
 *                 type: string
 *                 example: "https://ejemplo.com/imagen.jpg"
 *               parentId:
 *                 type: integer
 *                 example: null
 *                 description: ID de la categoría padre (opcional)
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Datos inválidos o slug duplicado
 *       403:
 *         description: No autorizado (Requiere Admin)
 */

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Actualizar una categoría
 *     description: Solo administradores.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               parentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 * 
 *   delete:
 *     summary: Eliminar una categoría
 *     description: Solo administradores. No se puede eliminar si tiene productos o subcategorías.
 *     tags: [Categories]
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
 *         description: Categoría eliminada correctamente
 *       400:
 *         description: No se puede eliminar (tiene productos asociados)
 *       403:
 *         description: No autorizado
 */