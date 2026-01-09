# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
