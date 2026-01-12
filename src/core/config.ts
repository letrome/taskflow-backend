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
});

// We generally populate default environment variables if they are missing
// and then parse process.env to ensure it matches the schema.
const env = envSchema.parse(process.env);

export const PORT = env.PORT;
export const BASIC_SECRET = env.BASIC_SECRET;
export const PINO_LOG_LEVEL = env.PINO_LOG_LEVEL;
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS;
export const MONGO_URI = env.MONGO_URI;
