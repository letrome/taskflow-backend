# Architecture

TaskFlow Backend follows a layered architecture to ensure separation of concerns, testability, and scalability.

## Directory Structure

```
src/
├── controllers/    # Request handlers (Input -> Service -> Response)
├── middlewares/    # Express middlewares (Validation, Auth, Errors)
├── models/         # Mongoose Schemas & Types
├── routes/         # API Route definitions
├── services/       # Business Logic & Database interactions
├── utils/          # Helper functions and constants
├── app.ts          # Express App setup
└── index.ts        # Entry point (Server start)
```

## Key Patterns

### Service-Controller Pattern
*   **Controllers**: Handle HTTP concerns (req/res, status codes). They **never** contain business logic or direct DB calls.
*   **Services**: contain the core business logic. They are reusable and testable. They accept standard arguments and return standard objects (or throw Errors).

### Validation
We use **Zod** for runtime validation.
*   Inputs (Body, Query, Params) are validated via the `validateRequest` middleware using Zod schemas.
*   Types are inferred directly from Zod schemas to ensure Type Safety.

### Error Handling
A centralized `ErrorHandler` middleware catches all synchronous and asynchronous errors.
*   We use custom Error classes (`HttpError`, `BadRequestError`) to standardize responses.
*   All unhandled rejections are caught to prevent server crashes.

### Dependency Injection
we use a pragmatic approach where services are imported directly. We use `vi.mock()` in tests to isolate dependencies.
