# Configuration

TaskFlow Backend relies on environment variables for configuration. These are managed via [Infisical](https://infisical.com/) to ensure security and consistency across environments.

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | The port the server listens on | `4000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *<secure-random-string>* |
| `BASIC_SECRET` | Secret key for Basic Auth (Metrics/Admin) | *<secure-random-string>* |
| `EXPIRES_IN_SECONDS` | JWT Token expiration time | `86400` (24h) |
| `PINO_LOG_LEVEL` | Logging level | `info` or `debug` |
| `ALLOWED_ORIGINS` | CORS Info (comma separated) | `http://localhost:3000` |

## Secret Management (Infisical)

We do not use `.env` files for secrets in this project. All secrets are pulled from Infisical at runtime.

### Why Infisical?

*   **Security**: No risk of checking `.env` files into Git.
*   **Consistency**: Everyone on the team uses the same updated secrets.
*   **Versioning**: History of secret changes.

### Local Development

When you run `pnpm run dev`, the command executed is:

```bash
infisical run --env=dev tsx watch src/index.ts
```

This commands Infisical to fetch `dev` environment secrets and inject them into the `tsx` process.

### CI/CD Configuration

In GitHub Actions, we use the `Infisical/secrets-action` to inject secrets into workflow steps.

```yaml
- uses: Infisical/secrets-action@v1.0.9
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    env-slug: "prod"
```
