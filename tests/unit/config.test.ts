import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should verify PORT defaults to 4000 when undefined", async () => {
		delete process.env.PORT;
		const { PORT } = await import("../../src/core/config.js");
		expect(PORT).toBe(4000);
	});

	it("should verify PORT uses the provided number", async () => {
		process.env.PORT = "5000";
		const { PORT } = await import("../../src/core/config.js");
		expect(PORT).toBe(5000);
	});

	it("should verify PORT defaults to 4000 for invalid number", async () => {
		process.env.PORT = "invalid";
		const { PORT } = await import("../../src/core/config.js");
		expect(PORT).toBe(4000);
	});

	it("should verify PORT defaults to 4000 for negative number", async () => {
		process.env.PORT = "-1";
		const { PORT } = await import("../../src/core/config.js");
		expect(PORT).toBe(4000);
	});

	it("should verify BASIC_SECRET uses the provided value", async () => {
		process.env.BASIC_SECRET = "super-secret";
		const { BASIC_SECRET } = await import("../../src/core/config.js");
		expect(BASIC_SECRET).toBe("super-secret");
	});

	it("should throw error when BASIC_SECRET is undefined", async () => {
		delete process.env.BASIC_SECRET;
		await expect(import("../../src/core/config.js")).rejects.toThrow(
			"BASIC_SECRET is not defined",
		);
	});

	it("should verify PINO_LOG_LEVEL uses the provided value", async () => {
		process.env.PINO_LOG_LEVEL = "warn";
		const { PINO_LOG_LEVEL } = await import("../../src/core/config.js");
		expect(PINO_LOG_LEVEL).toBe("warn");
	});

	it("should use info as default value when PINO_LOG_LEVEL is undefined", async () => {
		delete process.env.PINO_LOG_LEVEL;
		const { PINO_LOG_LEVEL } = await import("../../src/core/config.js");
		expect(PINO_LOG_LEVEL).toBe("info");
	});

	it("should use info as default value when PINO_LOG_LEVEL is invalid", async () => {
		process.env.PINO_LOG_LEVEL = "invalid";
		const { PINO_LOG_LEVEL } = await import("../../src/core/config.js");
		expect(PINO_LOG_LEVEL).toBe("info");
	});
});
