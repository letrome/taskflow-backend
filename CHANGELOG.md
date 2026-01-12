# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
