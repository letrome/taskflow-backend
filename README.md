# TaskFlow Backend

A backend service for the TaskFlow application, built with Node.js, Express, and TypeScript.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/) (Package manager)

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

3. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```

## 🛠️ Scripts

- **`pnpm run dev`**: Starts the development server with hot-reloading using `tsx watch`.
- **`pnpm test`**: Runs all tests (Unit, Integration, and E2E) in sequence.
- **`pnpm run test:unit`**: Runs unit tests located in `tests/unit`.
- **`pnpm run test:integration`**: Runs integration tests located in `tests/integration`.
- **`pnpm run test:e2e`**: Automated E2E testing. Starts a clean server instance on port 3001 and runs Bruno API tests against it.

## 🔌 API Endpoints

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

## 🧰 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Tooling**:
  - [tsx](https://github.com/privatenumber/tsx) (Execution)
  - [Vitest](https://vitest.dev/) (Unit & Integration Runner)
  - [Supertest](https://github.com/ladjs/supertest) (HTTP Assertions)
  - [Bruno](https://www.usebruno.com/) (End-to-End API Testing)
