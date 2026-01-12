import { UnauthorizedError } from "@src/core/errors.js";
import basicAuth from "@src/middlewares/auth.js";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

describe("basicAuth", () => {
	it("should pass", () => {
		const request = createMockRequest({
			headers: {
				authorization: `Basic ${Buffer.from("admin:test-secret").toString("base64")}`,
			},
		});
		const response = createMockResponse();

		const nextStub = vi.fn();

		basicAuth(request, response, nextStub);

		expect(nextStub).toHaveBeenCalled();
	});

	it("should return unauthorized when no authorization header", () => {
		const request = createMockRequest({
			headers: {},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when invalid authorization type", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Bearer test-secret",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when invalid authorization secret", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Basic wrong-secret",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when enmpty authorization value", () => {
		const request = createMockRequest({
			headers: {
				authorization: "",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when authorization value has no space", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Basicwrong-secret",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});
});
