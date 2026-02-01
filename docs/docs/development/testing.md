# Testing Strategy

We maintain a high standard of code quality through a three-tier testing strategy.

## 1. Unit Tests (`tests/unit`)
*   **Tool**: Vitest
*   **Focus**: Individual functions, services, and middlewares in isolation.
*   **Mocking**: database calls and external dependencies are mocked.

```bash
pnpm run test:unit
```

## 2. Integration Tests (`tests/integration`)
*   **Tool**: Vitest + MongoDB Memory Server (or local DB)
*   **Focus**: API endpoints, database interactions, and service logic.
*   **Setup**: Starts a real MongoDB instance (or container), seeds data, runs request via `supertest`, and asserts the response and DB state.

```bash
pnpm run test:integration
```

## 3. End-to-End (E2E) Tests
*   **Tool**: Bruno + Docker Compose
*   **Focus**: Full system verification in a production-like environment.
*   **Flow**:
    1.  `docker compose -f docker-compose.test.yml up` (Clean Mongo instance)
    2.  Start Backend with Test Config.
    3.  `bru run --env e2e` (Run Bruno Collection).
    4.  Teardown.

```bash
pnpm run test:e2e
```

## SonarQube & Coverage
We use SonarQube to track technical debt and code coverage.
*   **Linting**: Biome is strictly enforced.
*   **Coverage**: Must be maintained above the defined threshold (e.g. 80%).
