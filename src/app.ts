import express from 'express';

import adminRoutes from './routes/admin.js';

import { metricsMiddleware } from './middlewares/metrics.js';
import { PORT } from './config.js';

const app: express.Application = express();

app.set('port', PORT);

app.use(metricsMiddleware);
app.use(express.json());

app.disable("x-powered-by");

app.use('/', adminRoutes);

export default app;
