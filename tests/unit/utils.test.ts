import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import logger from "../../src/logger.js";
import { errorHandler, logListening } from "../../src/utils.js";

describe("errorHandler", () => {
	const mockServer = {
		address: vi.fn(),
	} as unknown as Server;

	beforeEach(() => {
		vi.spyOn(logger, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should throw error if syscall is not listen", () => {
		const error = new Error("test") as NodeJS.ErrnoException;
		error.syscall = "read";
		expect(() => errorHandler(error, mockServer, 3000)).toThrow(error);
	});

	it("should exit process with 1 on EACCES", () => {
		const error = new Error("test") as NodeJS.ErrnoException;
		error.syscall = "listen";
		error.code = "EACCES";
		vi.mocked(mockServer.address).mockReturnValue(null);

		expect(() => errorHandler(error, mockServer, 3000)).toThrow("process.exit");
		expect(logger.error).toHaveBeenCalled();
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it("should exit process with 1 on EADDRINUSE", () => {
		const error = new Error("test") as NodeJS.ErrnoException;
		error.syscall = "listen";
		error.code = "EADDRINUSE";
		vi.mocked(mockServer.address).mockReturnValue(null);

		expect(() => errorHandler(error, mockServer, 3000)).toThrow("process.exit");
		expect(logger.error).toHaveBeenCalled();
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it("should throw error for other error codes", () => {
		const error = new Error("test") as NodeJS.ErrnoException;
		error.syscall = "listen";
		error.code = "OTHER";
		vi.mocked(mockServer.address).mockReturnValue(null);

		expect(() => errorHandler(error, mockServer, 3000)).toThrow(error);
	});
});

describe("logListening", () => {
	const mockServer = {
		address: vi.fn(),
	} as unknown as Server;

	beforeEach(() => {
		vi.spyOn(logger, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should log listening (port)", () => {
		vi.mocked(mockServer.address).mockReturnValue(null);
		logListening(mockServer, 3000);
		expect(logger.info).toHaveBeenCalledWith("Listening on port 3000");
	});
});
