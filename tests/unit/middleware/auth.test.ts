import { UnauthorizedError } from "@src/core/errors.js";
import { basicAuth, jwtAuth } from "@src/middlewares/auth.js";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { createMockRequest, createMockResponse } from "../test-utils.js";

vi.mock("jsonwebtoken");

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

describe("jwtAuth", () => {
	it("should add auth object to request when authorization is valid", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Bearer test-secret",
			},
		});

		vi.mocked(jwt.verify).mockReturnValue({
			id: "test-id",
			roles: ["test-role"],
			// biome-ignore lint/suspicious/noExplicitAny: Mock implementation needs access to this
		} as any);
		const response = createMockResponse();
		const nextStub = vi.fn();

		jwtAuth(request, response, nextStub);

		expect(request.auth).toEqual({
			userId: "test-id",
			roles: ["test-role"],
		});
		expect(nextStub).toHaveBeenCalled();
	});

	it("should return unauthorized when authorization type is not Bearer", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Basic wrong-secret",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => jwtAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when no authorization header has no space", () => {
		const request = createMockRequest({
			headers: {
				authorization: "Bearer",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();

		expect(() => jwtAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});
});
