# Authentication Guide

TaskFlow uses robust **JWT (JSON Web Token)** authentication to secure endpoints.

## Auth Flow

1.  **Login**: User sends `email` and `password` to `/auth/login`.
    *   Server validates credentials (bcrypt).
    *   Server signs a JWT containing the user ID and Roles.
    *   Server returns the `token`.

2.  **Authenticated Requests**: Client sends the token in the `Authorization` header.
    ```http
    GET /projects HTTP/1.1
    Authorization: Bearer <your_jwt_token>
    ```

3.  **Role Verification**: specific endpoints (like `create-user`) check the JWT payload for `ROLE_ADMIN`.

## Error Handling

*   `401 Unauthorized`: Token is missing, invalid, or expired.
*   `403 Forbidden`: Token is valid, but the user lacks the required role (e.g., standard user trying to access admin route).
