import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().min(0).default(4000),
	BASIC_SECRET: z.string().min(1, { message: "BASIC_SECRET is not defined" }),
	PINO_LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	ALLOWED_ORIGINS: z
		.string()
		.default("")
		.transform((val) => (val ? val.split(",") : [])),
	MONGO_URI: z.string().min(1, { message: "MONGO_URI is not defined" }),
	EXPIRES_IN_SECONDS: z.coerce.number().min(60).max(86400).default(3600),
	JWT_SECRET: z.string().min(20, { message: "JWT_SECRET is not defined" }),
});

const env = envSchema.parse(process.env);

export const PORT = env.PORT;
export const BASIC_SECRET = env.BASIC_SECRET;
export const PINO_LOG_LEVEL = env.PINO_LOG_LEVEL;
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS;
export const MONGO_URI = env.MONGO_URI;
export const EXPIRES_IN_SECONDS = env.EXPIRES_IN_SECONDS;
export const JWT_SECRET = env.JWT_SECRET;
