import express from "express";
import { PORT } from "./core/config.js";

import { metricsMiddleware } from "./middlewares/metrics.js";
import adminRoutes from "./routes/admin.js";

const app: express.Application = express();

app.set("port", PORT);

app.use(metricsMiddleware);
app.use(express.json());

app.disable("x-powered-by");

app.use("/", adminRoutes);

export default app;
