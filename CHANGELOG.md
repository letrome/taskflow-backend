# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.13] - 2026-01-21

### Added

- Task management endpoints:
  - `POST /projects/:id/tasks`: Create a new task in a project.
  - `GET /projects/:id/tasks`: Retrieve all tasks for a project.
  - `GET /tasks/:id`: Retrieve a specific task by ID.
  - `POST /tasks/:id/:state`: Update the status of a task.
  - `PATCH /tasks/:id`: Partially update a task.
  - `DELETE /tasks/:id`: Delete a task.

### Changed

- Updated dependency `mongoose` to 9.1.5.

### Fixed

- Resolved issues in Task Controller exception handling.

## [0.1.12] - 2026-01-20

### Fixed

- Fixed issue in error handling in tag controller leading to server crash

- Code refactoring

## [0.1.11] - 2026-01-20

### Added

- Code refactoring

## [0.1.10] - 2026-01-18

### Changed

- Replaced local `.env` file management with **Infisical** for better secrets security and synchronization.
- Updated `README.md` with new setup instructions using Infisical CLI.

### Fixed

- Fixed a regression in `deploy` workflow where `docker login` failed due to missing `$GITHUB_ACTOR` context. Now using direct interpolation `${{ github.actor }}`.

## [0.1.9] - 2026-01-18

### Added

- Tag management endpoints:
  - `POST /projects/:id/tags`: Create a new tag for a project.
  - `GET /projects/:id/tags`: Retrieve all tags for a project.
  - `PATCH /tags/:id`: Update an existing tag (rename or move to another project).
  - `DELETE /tags/:id`: Delete a tag.

### Changed

- Updated `vitest.config.ts` to improve CI stability by disabling file parallelism and increasing timeouts.

## [0.1.8] - 2026-01-16

### Added

- Project member management endpoints:
  - `POST /projects/:id/members`: Add a member to a project.
  - `DELETE /projects/:id/members/:memberId`: Remove a member from a project.

## [0.1.7] - 2026-01-16

### Added

- Project management endpoints:
  - `POST /projects`: Create a new project.
  - `GET /projects`: Retrieve all projects.
  - `GET /projects/:id`: Retrieve a specific project by ID.
  - `PUT /projects/:id`: Update an existing project (full replacement).
  - `PATCH /projects/:id`: Partially update an existing project.
  - `DELETE /projects/:id`: Delete a project.

### Fixed

- Added missing environment variables in the deploy workflow.

### Changed

- Updated dependencies: `mongoose` (9.1.4), `pino` (10.2.0), `@types/node`.

## [0.1.6] - 2026-01-14

### Fixed

- Fixed `getUser` endpoint to read `id` path param.

## [0.1.5] - 2026-01-14

### Added

- Authentication endpoints: `POST /auth/register`, `POST /auth/login`, `GET /users/me`.
- comprehensive Unit and Integration tests for Authentication.

### Fixed

- E2E test suite stability.

## [0.1.4] - 2026-01-13

### Added

- Added field `created_at` in get user and create user response.

## [0.1.3] - 2026-01-12

### Added

- **Zod** integration for runtime schema validation.
- Global error handling architecture with custom error classes.
- Standardized validation middleware using Zod schemas.

### Changed

- Refactored Admin Service and Controllers to use Zod validation and new error handling flow.

## [0.1.2] - 2026-01-11

### Added

- MongoDB integration with Mongoose.
- User model and schema with automatic JSON security transform.
- Admin endpoint `POST /create-user` for user creation.
- Environment variable `MONGO_URI` injection in deployment workflows.

## [0.1.1] - 2026-01-10

### Added

- CORS configuration with `ALLOWED_ORIGINS` env var support.
- Helmet security headers.

### Changed

- Replaced `console` logging with `pino` structured logger.
- Replaced ESLint/Prettier with **Biome** for faster linting and formatting.
- Refactored project structure: moved core logic (`config`, `logger`, `utils`) to `src/core/`.

## [0.1.0] - 2026-01-09

### Added

**Infrastructure & CI/CD**

- Complete CI/CD pipeline with GitHub Actions for automated testing, building, and deployment.
- Multi-stage Dockerfile for optimized production builds.
- Automated release management (`cut-release`) with changelog extraction and semantic versioning.
- Deployment workflows for preprod/prod environments.
- Slack notifications for releases, deployments, and Dependabot alerts.

**API & Backend**

- Core Express.js application setup with TypeScript.
- Admin routes: `/health`, `/version`, and `/metrics`.
- Prometheus metrics integration with `prom-client`.
- Secure Basic Authentication middleware for protected endpoints.

**Testing & Quality**

- Comprehensive testing strategy: Unit, Integration, and End-to-End (E2E) tests.
- SonarQube integration for code quality and coverage analysis.
- End-to-end testing pipeline using Bruno and `start-server-and-test`.
- Smoketests in deployment workflows to verify successful deployments.

## [0.0.17] - 2026-01-09

### Changed

- Updated Basic Auth middleware to support standard Base64 encoding.

## [0.0.16] - 2026-01-09

### Added

- Metrics middleware for Prometheus.

## [0.0.15] - 2026-01-09

### Added

- Smoketest in the deploy workflow.
- End-to-end tests workflow.
- `/metrics` endpoint for Prometheus.

## [0.0.14] - 2026-01-09

### Added

- Slack notifications for releases and deploys.
- Slack notifications for dependabot alerts.

## [0.0.13] - 2026-01-08

### Added

- New `/version` endpoint to retrieve service version.
- Admin controller and routes.

### Changed

- Refactored `health` check to use the new Admin controller.
- Updated `deploy.yml` to fix linter context access errors for `TARGET_IP` and `SSH_PRIVATE_KEY`.
- Updated `.gitignore` to include `.vscode`.

## [0.0.6] - 2026-01-08

### Changed

- Refactored `cut-release` workflow to automatically generate release notes from CHANGELOG, removing the need for a separate workflow.
- Fixed `target_commitish` in release workflow to correctly target the `main` branch.

### Added

- Deployment workflow `deploy.yml` for manual deployment to preprod/prod environments.

## [0.0.5] - 2026-01-08

### Added

- CI/CD workflows for automated release building and deployment.
- Dockerfile for multi-stage container build.
- Build script in package.json and tsconfig.build.json.
