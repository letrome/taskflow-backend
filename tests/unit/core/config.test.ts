import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

describe("config", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("should verify PORT defaults to 4000 when undefined", async () => {
		// Ensure PORT is not set
		vi.stubEnv("PORT", undefined);
		const { PORT } = await import("../../../src/core/config.js");
		expect(PORT).toBe(4000);
	});

	it("should verify PORT uses the provided number", async () => {
		vi.stubEnv("PORT", "5000");
		const { PORT } = await import("../../../src/core/config.js");
		expect(PORT).toBe(5000);
	});

	it("should verify PORT throws validation error for invalid number", async () => {
		vi.stubEnv("PORT", "invalid");
		await expect(import("../../../src/core/config.js")).rejects.toThrow(
			ZodError,
		);
	});

	it("should verify PORT defaults to 4000 for negative number", async () => {
		// Note from schema: .min(0) means negative numbers fail validation
		vi.stubEnv("PORT", "-1");
		await expect(import("../../../src/core/config.js")).rejects.toThrow(
			ZodError,
		);
	});

	it("should verify BASIC_SECRET uses the provided value", async () => {
		vi.stubEnv("BASIC_SECRET", "super-secret");
		const { BASIC_SECRET } = await import("../../../src/core/config.js");
		expect(BASIC_SECRET).toBe("super-secret");
	});

	it("should throw error when BASIC_SECRET is undefined", async () => {
		vi.stubEnv("BASIC_SECRET", undefined);
		await expect(import("../../../src/core/config.js")).rejects.toThrow(
			ZodError,
		);
	});

	it("should verify PINO_LOG_LEVEL uses the provided value", async () => {
		vi.stubEnv("PINO_LOG_LEVEL", "warn");
		const { PINO_LOG_LEVEL } = await import("../../../src/core/config.js");
		expect(PINO_LOG_LEVEL).toBe("warn");
	});

	it("should use info as default value when PINO_LOG_LEVEL is undefined", async () => {
		vi.stubEnv("PINO_LOG_LEVEL", undefined);
		const { PINO_LOG_LEVEL } = await import("../../../src/core/config.js");
		expect(PINO_LOG_LEVEL).toBe("info");
	});

	it("should throw validation error when PINO_LOG_LEVEL is invalid", async () => {
		vi.stubEnv("PINO_LOG_LEVEL", "invalid");
		await expect(import("../../../src/core/config.js")).rejects.toThrow(
			ZodError,
		);
	});

	it("should verify ALLOWED_ORIGINS uses the provided value", async () => {
		vi.stubEnv("ALLOWED_ORIGINS", "http://localhost:4001");
		const { ALLOWED_ORIGINS } = await import("../../../src/core/config.js");
		expect(ALLOWED_ORIGINS).toEqual(["http://localhost:4001"]);
	});

	it("should use empty array as default value when ALLOWED_ORIGINS is undefined", async () => {
		vi.stubEnv("ALLOWED_ORIGINS", undefined);
		const { ALLOWED_ORIGINS } = await import("../../../src/core/config.js");
		expect(ALLOWED_ORIGINS).toEqual([]);
	});
});
