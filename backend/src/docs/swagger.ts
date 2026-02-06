import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LhamsDJ E-commerce API',
      version: '1.0.0',
      description: 'API RESTful para E-commerce construida con Node.js, Express, TypeScript y Prisma.',
      contact: {
        name: 'Soporte API',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Aquí le decimos dónde buscar la documentación de los endpoints
  apis: ['./src/docs/*.ts'], 
};

export const swaggerSpec = swaggerJSDoc(options);