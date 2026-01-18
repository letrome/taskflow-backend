# TaskFlow Backend

A backend service for the TaskFlow application, built with Node.js, Express, and TypeScript.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/) (Package manager)
- [MongoDB](https://www.mongodb.com/) (Database)
- [Infisical](https://infisical.com/) (Secrets Management)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd taskflow-backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Setup Infisical for secrets management:

   ```bash
   # Install Infisical
   brew install infisical/get/infisical

   # Login
   infisical login

   # Initialize project (select existing project if prompted)
   infisical init

   # Run the application
   pnpm run dev
   ```

## 🛠️ Scripts

- **`pnpm run dev`**: Starts the development server with hot-reloading using `tsx watch`.
- **`pnpm test`**: Runs all tests (Unit, Integration, and E2E) in sequence.
- **`pnpm run test:unit`**: Runs unit tests located in `tests/unit`.
- **`pnpm run test:integration`**: Runs integration tests located in `tests/integration`.
- **`pnpm run test:coverage`**: Runs tests with code coverage reporting.
- **`pnpm run test:e2e`**: Automated E2E testing. Starts a clean server instance on port 3001 and runs Bruno API tests against it.
- **`pnpm lint`**: Checks code quality and formatting using Biome.
- **`pnpm lint:fix`**: Automatically fixes linting errors and formats code using Biome.
- **`pnpm sonar`**: Runs the SonarQube scanner to analyze code quality and coverage.

## � CI/CD & Automation

- **GitHub Actions**: Workflows are configured for:
  - **Unit Tests**: Runs `test:unit` on `push` and manual trigger.
  - **Integration Tests**: Runs `test:integration` on `pull_request` and manual trigger.
  - Both workflows include Slack notifications for build status.
- **Dependabot**: Automated dependency updates are enabled. Checks for `npm` package updates daily and opens pull requests.
- **Releases**:
  - **Cut Release**: Manual workflow to bump version, tag, and create a GitHub Release.
  - **Docker Build**: Automatically builds and pushes Docker image to GHCR on release.
  - **Release Notes**: The `Cut Release` workflow automatically populates the release body with notes from `CHANGELOG.md`.
- **Deployment**:
  - **Deploy**: Manual workflow to deploy a specific environment (preprod/prod) using the built Docker image.

## �🔌 API Endpoints

### Health Check

- **URL**: `/health`
- **Method**: `GET`
- **Description**: Checks if the API is running.
- **Response**:
  ```json
  {
    "status": "OK"
  }
  ```

### Version

- **URL**: `/version`
- **Method**: `GET`
- **Description**: Returns the current version of the service.
- **Response**:
  ```json
  {
    "version": "0.0.13"
  }
  ```

### Metrics

- **URL**: `/metrics`
- **Method**: `GET`
- **Description**: Exposes application metrics for Prometheus scraping.
- **Auth**: Requires standard `Basic Auth` (Base64 encoded `username:password`). Password must match `BASIC_SECRET`.
- **Response**: Prometheus formatted metrics.

### Create User

- **URL**: `/create-user`
- **Method**: `POST`
- **Description**: Creates a new user (Admin only).
- **Auth**: Requires standard `Basic Auth`.
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["ROLE_USER"]
  }
  ```
- **Response**: Returns the created user object (password hash removed).

### Authentication

- **Register**
  - **URL**: `/auth/register`
  - **Method**: `POST`
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password",
      "first_name": "John",
      "last_name": "Doe"
    }
    ```
  - **Response**: `201 Created` with user details.

- **Login**
  - **URL**: `/auth/login`
  - **Method**: `POST`
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password"
    }
    ```
  - **Response**: `200 OK` with JWT token.

- **Get Current User**
  - **URL**: `/users/me`
  - **Method**: `GET`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with user profile.

### Projects

- **Create Project**
  - **URL**: `/projects`
  - **Method**: `POST`
  - **Auth**: Bearer Token
  - **Body**:
    ```json
    {
      "title": "Project Alpha",
      "description": "A new ambitious project",
      "start_date": "2026-02-01",
      "end_date": "2026-12-31",
      "status": "active",
      "members": ["60d5ecb8b48734356891fd41"]
    }
    ```
  - **Response**: `201 Created` with project details.

- **Get All Projects**
  - **URL**: `/projects`
  - **Method**: `GET`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with a list of projects.

- **Get Project by ID**
  - **URL**: `/projects/:id`
  - **Method**: `GET`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with project details.

- **Update Project**
  - **URL**: `/projects/:id`
  - **Method**: `PUT`
  - **Description**: Fully replaces an existing project.
  - **Auth**: Bearer Token
  - **Body**: Same as Create Project.
  - **Response**: `200 OK` with updated project details.

- **Patch Project**
  - **URL**: `/projects/:id`
  - **Method**: `PATCH`
  - **Description**: Partially updates an existing project.
  - **Auth**: Bearer Token
  - **Body**:
    ```json
    {
      "status": "completed"
    }
    ```
  - **Response**: `200 OK` with updated project details.

- **Delete Project**
  - **URL**: `/projects/:id`
  - **Method**: `DELETE`
  - **Auth**: Bearer Token
  - **Response**: `204 No Content`.

### Project Members

- **Add Member**
  - **URL**: `/projects/:id/members`
  - **Method**: `POST`
  - **Auth**: Bearer Token
  - **Body**:
    ```json
    {
      "members": ["60d5ecb8b48734356891fd41"]
    }
    ```
  - **Response**: `200 OK` with updated project details.

- **Remove Member**
  - **URL**: `/projects/:id/members/:memberId`
  - **Method**: `DELETE`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with updated project details.

### Tags

- **Create Project Tag**
  - **URL**: `/projects/:id/tags`
  - **Method**: `POST`
  - **Auth**: Bearer Token
  - **Body**:
    ```json
    {
      "name": "Bug"
    }
    ```
  - **Response**: `201 Created` with tag details.

- **Get Project Tags**
  - **URL**: `/projects/:id/tags`
  - **Method**: `GET`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with list of tags.

- **Patch Tag**
  - **URL**: `/tags/:id`
  - **Method**: `PATCH`
  - **Auth**: Bearer Token
  - **Body**:
    ```json
    {
      "name": "Defect",
      "project": "60d5ecb8b48734356891fd41"
    }
    ```
  - **Response**: `200 OK` with updated tag details.

- **Delete Tag**
  - **URL**: `/tags/:id`
  - **Method**: `DELETE`
  - **Auth**: Bearer Token
  - **Response**: `200 OK` with deleted tag details.

## 🧰 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose)
- **Tooling**:
  - [tsx](https://github.com/privatenumber/tsx) (Execution)
  - [Vitest](https://vitest.dev/) (Unit & Integration Runner)
  - [Supertest](https://github.com/ladjs/supertest) (HTTP Assertions)
  - [Bruno](https://www.usebruno.com/) (End-to-End API Testing)
  - [SonarQube](https://www.sonarsource.com/) (Code Quality & Security)
  - [Prometheus Client](https://github.com/siimon/prom-client) (Metrics Collection)
  - [Pino](https://getpino.io/) (Structured Logging)
  - [Biome](https://biomejs.dev/) (Linting & Formatting)
  - [Zod](https://zod.dev/) (Schema Validation)
  - [Helmet](https://helmetjs.github.io/) (Security Headers)
