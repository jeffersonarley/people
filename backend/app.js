import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import empleadosRoutes from './routes/empleadosRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const app = express();

app.disable('x-powered-by');
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api', routes);
app.use('/api', empleadosRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
