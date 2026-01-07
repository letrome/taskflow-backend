import express from 'express';
import { normalizePort } from './utils.js';

const app: express.Application = express();

app.set('port', normalizePort(process.env.PORT));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

export default app;
