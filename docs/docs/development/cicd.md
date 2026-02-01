# CI/CD & Automation

We utilize GitHub Actions to automate testing, building, and deployment processes.

## Workflows

### 1. Unit Tests (`unit-tests.yml`)
*   **Trigger**: On `push` to any branch.
*   **Action**: Runs `pnpm run test:unit`.
*   **Environment**: `ubuntu-latest` with a MongoDB Service container.
*   **Notifications**: Sends success/failure alerts to Slack.

### 2. Integration Tests (`integration-tests.yml`)
*   **Trigger**: On `pull_request` to `main`.
*   **Action**: Runs `pnpm run test:integration`.
*   **Environment**: `ubuntu-latest` with Mongo Service.
*   **Security**: Prevents unauthorized code execution from forks by using isolated runners for PRs.

### 3. Release Process (`cut-release.yml`)
*   **Trigger**: Manual dispatch (Workflow Dispatch).
*   **Inputs**: `version` (e.g., `0.2.0`).
*   **Actions**:
    1.  Updates `package.json` version.
    2.  Extracts release notes from `CHANGELOG.md`.
    3.  Creates a GitHub Release with the tag/notes.
    4.  Builds the Docker Image (`Dockerfile`).
    5.  Pushes image to **GHCR** (GitHub Container Registry).

### 4. Deployment (`deploy.yml`)
*   **Trigger**: Manual dispatch.
*   **Inputs**: `environment` (`preprod` | `prod`).
*   **Action**:
    1.  SSH connects to the target self-hosted server.
    2.  Pulls the latest Docker image from GHCR.
    3.  Restarts the container with the selected environment's secrets (injected via Infisical).
    4.  Performs a health check (`/health`).
    5.  Rolls back or notifies Slack on failure.

### 5. Documentation (`deploy-docs.yml`)
*   **Trigger**: On `push` to `main`.
*   **Action**: Builds the MkDocs site and deploys it to GitHub Pages.
