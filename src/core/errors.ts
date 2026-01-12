export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
		Error.captureStackTrace(this);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Not Found") {
		super(message, 404);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Conflict") {
		super(message, 409);
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Internal Server Error") {
		super(message, 500, false);
	}
}
