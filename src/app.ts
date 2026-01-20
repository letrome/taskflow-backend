import cors from "cors";
import express from "express";
import helmet from "helmet";
import { ALLOWED_ORIGINS, PORT } from "./core/config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { metricsMiddleware } from "./middlewares/metrics.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import tagRoutes from "./routes/tag.js";
import taskRoutes from "./routes/task.js";
import userRoutes from "./routes/user.js";

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
app.use("/auth", authRoutes);
app.use("/", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tags", tagRoutes);
app.use("/tasks", taskRoutes);

app.use(errorHandler);

export default app;
