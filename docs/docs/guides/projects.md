# Projects & Tasks

## Data Model

*   **Project**: Top-level container. Has a title, status, and members.
*   **Task**: Atomic unit of work. Belongs to a Project. Assigned to a User.
*   **Tag**: Label attached to a Task for categorization.

## Typical Workflow

### Creating a Project

```http
POST /projects
{
  "title": "New Web App",
  "start_date": "2026-03-01",
  "members": ["UserID_1", "UserID_2"]
}
```

### Adding Tasks

Tasks are created *within* a project context.

```http
POST /projects/:projectId/tasks
{
  "title": "Setup CI/CD",
  "priority": "high",
  "assignee": "UserID_1"
}
```

### Filtering Tasks

The `GET /projects/:id/tasks` endpoint is powerful.

*   **By Status**: `?state=todo`
*   **By Priority**: `?priority=high`
*   **Search**: `?search=setup`
*   **Sorting**: `?sort=-due_date` (descending)
