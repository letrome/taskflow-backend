# TaskFlow Backend

**TaskFlow Backend** is a robust project management service built with Node.js, Express, and TypeScript. It provides a comprehensive API for managing users, projects, tasks, and tags with enterprise-grade security and scalability.

## Key Features

*   **Secure Authentication**: JWT-based auth with Role-Based Access Control (RBAC).
*   **Project Management**: Full lifecycle management for projects and tasks.
*   **Performance**: Optimized with MongoDB indexing, connection pooling, and structured logging.
*   **Developer Experience**: Fully typed with TypeScript, validated with Zod, and tested with Vitest.
*   **Observability**: Prometheus metrics and OpenTelemetry-ready structure.

## Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
*   **Validation**: [Zod](https://zod.dev/)
*   **Testing**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest), [Bruno](https://www.usebruno.com/)
*   **Quality**: [Biome](https://biomejs.dev/) (Lint/Format), [SonarQube](https://www.sonarsource.com/)
*   **Security**: [Infisical](https://infisical.com/) (Secrets), [Helmet](https://helmetjs.github.io/)

## Quick Links

*   [GitHub Repository](https://github.com/letrome/taskflow-backend)
*   [API Reference](api-reference.md)
*   [Getting Started](getting-started/installation.md)
