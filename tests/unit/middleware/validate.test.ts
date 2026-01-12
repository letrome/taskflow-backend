import { createUserSchema } from "@src/controllers/schemas/user.js";
import { validate } from "@src/middlewares/validate.js";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createMockRequest, createMockResponse } from "../test-utils.js";

describe("validate", () => {
	it("should pass", () => {
		const request = createMockRequest({
			body: {
				email: "test@example.com",
				password: "test-password",
				first_name: "test",
				last_name: "example",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();
		validate(createUserSchema)(request, response, nextStub);

		expect(nextStub).toHaveBeenCalled();
		expect(nextStub).not.toHaveBeenCalledWith(expect.any(Error));
	});

	it("should call next with ZodError on failure", () => {
		const request = createMockRequest({
			body: {
				password: "test-password",
				first_name: "test",
				last_name: "example",
			},
		});
		const response = createMockResponse();
		const nextStub = vi.fn();
		validate(createUserSchema)(request, response, nextStub);

		expect(nextStub).toHaveBeenCalledWith(expect.any(ZodError));
	});
});
