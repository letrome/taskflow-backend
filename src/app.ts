import express from 'express';
import { normalizePort } from './utils.js';

import adminRoutes from './routes/admin.js';

import { metricsMiddleware } from './middlewares/metrics.js';

const app: express.Application = express();

app.set('port', normalizePort(process.env.PORT));

app.use(metricsMiddleware);
app.use(express.json());

app.disable("x-powered-by");

app.use('/', adminRoutes);

export default app;
