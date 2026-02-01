# Installation

This guide will help you set up the TaskFlow Backend for local development.

## Prerequisites

Ensure you have the following installed on your machine:

*   **[Node.js](https://nodejs.org/)** (Latest LTS version recommended)
*   **[pnpm](https://pnpm.io/)** (Package manager)
*   **[MongoDB](https://www.mongodb.com/)** (Database) - *Optional if using Docker*
*   **[Infisical](https://infisical.com/)** (Secrets Management)

## Cloning the Repository

```bash
git clone https://github.com/letrome/taskflow-backend.git
cd taskflow-backend
```

## Installing Dependencies

Install the project dependencies using `pnpm`:

```bash
pnpm install
```

## Setting up Environment Variables

We use **Infisical** to manage secrets securely.

1.  **Install the Infisical CLI**:
    ```bash
    brew install infisical/get/infisical
    ```

2.  **Login to Infisical**:
    ```bash
    infisical login
    ```

3.  **Initialize the Project**:
    Select the existing project if prompted.
    ```bash
    infisical init
    ```

## Running the Application

Start the development server with hot-reloading:

```bash
pnpm run dev
```

This command uses `infisical run` to inject environment variables and `tsx watch` to restart on file changes.
