import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import * as fs from 'fs';
import * as path from 'path';

// Auth Schemas
import { loginSchema, registerSchema } from '../controllers/schemas/auth.js';
// User Schemas
import { 
    updateUserInformationSchema, 
    patchUserInformationSchema, 
    updateEmailSchema, 
    updatePasswordSchema 
} from '../controllers/schemas/user.js';
// Project Schemas
import { 
    createOrUpdateProjectSchema, 
    patchProjectSchema, 
    addProjectMemberSchema 
} from '../controllers/schemas/project.js';
// Task Schemas
import { 
    createTaskSchema, 
    patchTaskSchema
} from '../controllers/schemas/task.js';
// Tag Schemas
import { createTagSchema, patchTagSchema } from '../controllers/schemas/tag.js';

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'API documentation for TaskFlow Backend',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  paths: {
    // Auth Routes
    '/auth/login': {
      post: {
        summary: 'User Login',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': { schema: loginSchema },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'User Register',
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': { schema: registerSchema },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
        },
      },
    },

    // User Routes
    '/users/me': {
      get: {
        summary: 'Get Current User Profile',
        tags: ['Users'],
        responses: {
          '200': { description: 'User profile retrieved successfully' },
        },
      },
      put: {
        summary: 'Update User Profile',
        tags: ['Users'],
        requestBody: {
            content: { 'application/json': { schema: updateUserInformationSchema } }
        },
        responses: {
          '200': { description: 'User profile updated successfully' },
        },
      },
      patch: {
        summary: 'Patch User Profile',
        tags: ['Users'],
        requestBody: {
            content: { 'application/json': { schema: patchUserInformationSchema } }
        },
        responses: {
          '200': { description: 'User profile updated successfully' },
        },
      },
      delete: {
        summary: 'Delete Current User',
        tags: ['Users'],
        responses: {
          '200': { description: 'User deleted successfully' },
        },
      },
    },
    '/users/me/email': {
      put: {
        summary: 'Update User Email',
        tags: ['Users'],
        requestBody: {
            content: { 'application/json': { schema: updateEmailSchema } }
        },
        responses: {
          '200': { description: 'Email updated successfully' },
        },
      },
    },
    '/users/me/password': {
      put: {
        summary: 'Update User Password',
        tags: ['Users'],
        requestBody: {
            content: { 'application/json': { schema: updatePasswordSchema } }
        },
        responses: {
          '200': { description: 'Password updated successfully' },
        },
      },
    },
    '/users/me/consent': {
        post: {
            summary: 'Add User Consent',
            tags: ['Users'],
            responses: { '200': { description: 'Consent added' } }
        },
        delete: {
            summary: 'Remove User Consent',
            tags: ['Users'],
            responses: { '200': { description: 'Consent removed' } }
        }
    },

    // Project Routes
    '/projects': {
        get: {
            summary: 'Get All Projects',
            tags: ['Projects'],
            responses: { '200': { description: 'List of projects' } }
        },
        post: {
            summary: 'Create Project',
            tags: ['Projects'],
             requestBody: {
                content: { 'application/json': { schema: createOrUpdateProjectSchema } }
            },
            responses: { '201': { description: 'Project created' } }
        }
    },
    '/projects/{id}': {
        get: {
            summary: 'Get Project by ID',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'Project details' } }
        },
        put: {
            summary: 'Update Project',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: createOrUpdateProjectSchema } }
            },
            responses: { '200': { description: 'Project updated' } }
        },
        patch: {
            summary: 'Patch Project',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: patchProjectSchema } }
            },
            responses: { '200': { description: 'Project patched' } }
        },
         delete: {
            summary: 'Delete Project',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'Project deleted' } }
        }
    },
    '/projects/{id}/members': {
        post: {
            summary: 'Add Project Member',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: addProjectMemberSchema } }
            },
            responses: { '200': { description: 'Member added' } }
        }
    },
    '/projects/{id}/members/{memberId}': {
         delete: {
            summary: 'Remove Project Member',
            tags: ['Projects'],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Member removed' } }
        }
    },
    '/projects/{id}/tags': {
        get: {
            summary: 'Get Project Tags',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'List of tags' } }
        },
        post: {
            summary: 'Create Project Tag',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: createTagSchema } }
            },
            responses: { '201': { description: 'Tag created' } }
        }
    },
    '/projects/{id}/tasks': {
        get: {
            summary: 'Get Project Tasks',
            tags: ['Projects'],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                // Query params would go here, manually mapped from taskQuerySchema if desired, 
                // but zod-openapi v5 doesn't easily flattening object schemas to query params automatically in defining paths object directly.
                // For brevity, omitting explicit query params mapping here, but relying on description.
            ],
            responses: { '200': { description: 'List of tasks' } }
        },
        post: {
            summary: 'Create Project Task',
            tags: ['Projects'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: createTaskSchema } }
            },
            responses: { '201': { description: 'Task created' } }
        }
    },

    // Task Routes
    '/tasks/{id}': {
         get: {
            summary: 'Get Task by ID',
            tags: ['Tasks'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'Task details' } }
        },
        patch: {
            summary: 'Patch Task',
            tags: ['Tasks'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: {
                content: { 'application/json': { schema: patchTaskSchema } }
            },
            responses: { '200': { description: 'Task updated' } }
        },
        delete: {
            summary: 'Delete Task',
            tags: ['Tasks'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'Task deleted' } }
        }
    },
    '/tasks/{id}/{state}': {
        post: {
            summary: 'Set Task Status',
            tags: ['Tasks'],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'state', in: 'path', required: true, schema: { type: 'string' } } // simplified
            ],
            responses: { '200': { description: 'Status updated' } }
        }
    },
    '/tasks/{id}/tags/{tagId}': {
        post: {
            summary: 'Add Tag to Task',
            tags: ['Tasks'],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'tagId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Tag added' } }
        },
        delete: {
            summary: 'Remove Tag from Task',
            tags: ['Tasks'],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'tagId', in: 'path', required: true, schema: { type: 'string' } }
            ],
             responses: { '200': { description: 'Tag removed' } }
        }
    },

    // Tag Routes
    '/tags/{id}': {
        patch: {
            summary: 'Patch Tag',
            tags: ['Tags'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
             requestBody: {
                content: { 'application/json': { schema: patchTagSchema } }
            },
            responses: { '200': { description: 'Tag updated' } }
        },
        delete: {
            summary: 'Delete Tag',
            tags: ['Tags'],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'Tag deleted' } }
        }
    }
  },
});

const outputPath = path.resolve(process.cwd(), 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

console.log(`OpenAPI spec generated at ${outputPath}`);
