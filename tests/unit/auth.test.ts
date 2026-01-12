import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../src/core/errors.js";
import basicAuth from "../../src/middlewares/auth.js";

describe("basicAuth", () => {
	it("should pass", () => {
		const request = {
			headers: {
				authorization: `Basic ${Buffer.from("admin:test-secret").toString("base64")}`,
			},
		} as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;

		const nextStub = vi.fn();

		basicAuth(request, response, nextStub);

		expect(nextStub).toHaveBeenCalled();
	});

	it("should return unauthorized when no authorization header", () => {
		const request = {
			headers: {},
		} as Request;
		const response = {} as Response;
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when invalid authorization type", () => {
		const request = {
			headers: {
				authorization: "Bearer test-secret",
			},
		} as Request;
		const response = {} as Response;
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when invalid authorization secret", () => {
		const request = {
			headers: {
				authorization: "Basic wrong-secret",
			},
		} as Request;
		const response = {} as Response;
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when enmpty authorization value", () => {
		const request = {
			headers: {
				authorization: "",
			},
		} as Request;
		const response = {} as Response;
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});

	it("should return unauthorized when authorization value has no space", () => {
		const request = {
			headers: {
				authorization: "Basicwrong-secret",
			},
		} as Request;
		const response = {} as Response;
		const nextStub = vi.fn();

		expect(() => basicAuth(request, response, nextStub)).toThrow(
			UnauthorizedError,
		);
	});
});
