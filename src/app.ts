import cors from "cors";
import express from "express";
import helmet from "helmet";
import { ALLOWED_ORIGINS, PORT } from "./core/config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { metricsMiddleware } from "./middlewares/metrics.js";
import adminRoutes from "./routes/admin.js";

const app: express.Application = express();

const options: cors.CorsOptions = {
	origin: ALLOWED_ORIGINS,
};

app.use(helmet());
app.use(cors(options));
app.set("port", PORT);

app.use(metricsMiddleware);
app.use(express.json());

app.use("/", adminRoutes);

app.use(errorHandler);

export default app;
