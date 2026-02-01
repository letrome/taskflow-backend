# NPM Scripts

The `package.json` includes several scripts to help with development, testing, and maintenance.

## Development

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `infisical run ... tsx watch ...` | Starts the dev server with secrets injection and hot-reload. |
| `build` | `tsc` & `tsc-alias` | Compiles TypeScript to JavaScript (ESM) in `dist/`. |

## Testing

| Script | Command | Description |
| :--- | :--- | :--- |
| `test` | `vitest run && pnpm run test:e2e` | Runs the full test suite (Unit, Integration, E2E). |
| `test:unit` | `vitest tests/unit` | Runs only unit tests (fast). |
| `test:integration` | `vitest tests/integration` | Runs integration tests (requires MongoDB). |
| `test:coverage` | `vitest run --coverage` | Generates a code coverage report. |
| `test:e2e` | `docker compose ...` | Spins up a test env and runs Bruno API tests. |

## Code Quality

| Script | Command | Description |
| :--- | :--- | :--- |
| `lint` | `biome check .` | Checks for linting errors and formatting issues. |
| `lint:fix` | `biome check --write .` | Automatically fixes linting and formatting issues. |
| `sonar` | `sonar-scanner ...` | Runs analysis and pushes results to SonarQube. |

## Documentation

| Script | Command | Description |
| :--- | :--- | :--- |
| `generate:docs` | `tsx src/scripts/generate-openapi.ts` | Generates the `openapi.json` spec from code/Zod. |
