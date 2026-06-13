import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'ProxyForge API is running', timestamp: new Date().toISOString() });
});

import proxyProviderRouter from './routes/proxyProvider.js';
import proxyConnectRouter from './routes/proxyConnect.js';
import proxyValidatorRouter from './routes/proxyValidator.js';
import { residentialMesh } from './services/residentialMesh.js';

// Routes placeholders
app.use('/api/v1/auth', (req, res) => { res.status(501).json({ error: 'Not implemented yet' }) });
app.get('/api/v1/mesh/stats', (req, res) => {
  res.json(residentialMesh.getStats());
});
app.use('/api/v1/proxies', proxyProviderRouter);
app.use('/api/v1/proxy', proxyConnectRouter);
app.use('/api/v1/validate', proxyValidatorRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
