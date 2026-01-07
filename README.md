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
- **Tooling**: tsx (for running TypeScript directly)
