// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet'; 
import morgan from 'morgan'; 
import rateLimit from 'express-rate-limit'; 
// IMPORTACIONES DE SWAGGER
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import nocache from 'nocache';
import paymentRoutes from './routes/paymentRoutes';

// Importación de rutas (sin .js y ruta relativa correcta)
import routes from './routes/index'; 
// Importación del middleware de errores
import { errorHandler } from './middleware/errorMiddleware';

const app: Application = express();

// --- MIDDLEWARES GLOBALES ---

// 1. Seguridad de Headers
//app.use(helmet());


app.use(helmet({
  //contentSecurityPolicy: false, // API pura
  //crossOriginEmbedderPolicy: false,
   contentSecurityPolicy: false,   // API no usa CSP
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(nocache()); // <--- Agrega esto. Evita que el navegador guarde respuestas JSON.

// 2. Habilitar CORS
// app.use(cors({
//     origin: process.env.FRONTEND_URL || '*', 
//     methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Agregué PATCH que lo usaremos
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));



// Define los orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173', // Tu Frontend (Vite/React)
  'http://localhost:3000', // Tu Backend y Swagger Docs
  'http://localhost:4000', // Por si acaso usas otro puerto
  // 'https://midominio.com' // Tu dominio en producción
];

app.use(cors({
  
  origin: (origin, callback) => {
    // Permitir requests sin origen (como Postman, Apps móviles o CURL)
    if (!origin) return callback(null, true);

    // DEBUG: Imprimir quién intenta entrar (borrar en producción)
    console.log('Origen detectado:', origin);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Bloqueado por CORS. El origen '${origin}' no está permitido.`));
    }
  },
  credentials: false, // Importante para enviar cookies/headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
  
}));



// // Opción B: Array de orígenes permitidos (Local + Producción)
// const allowedOrigins = ['http://localhost:5173', 'https://lhamsdj.com'];
// app.use(cors({
//   origin: (origin, callback) => {
//     // Permitir requests sin origen (como Postman o Apps móbiles)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Bloqueado por CORS'));
//     }
//   }
// }));


// 3. Limiter: Máximo 100 peticiones por 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
});
app.use(limiter);

// 🚨 EL WEBHOOK VA ANTES DEL JSON GLOBAL 🚨
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes);

// 4. Parser de JSON y Logs
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// RUTA DE LA DOCUMENTACIÓN
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- RUTAS ---
// Versionado v1
app.use('/api/v1', routes);
// Resto de rutas (incluyendo paymentRoutes de nuevo para create-intent, no importa que se repita)
app.use('/api/v1/payments', paymentRoutes);


app.get('/', (req, res)=>{
    res.send('Mi servidor')
})

// --- MANEJO DE ERRORES ---
// Middleware global de errores (siempre va al final)
app.use(errorHandler);

export default app;