import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/app.js';
import fs from 'node:fs';
import path from 'node:path';

// Health Check
describe('Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const auth = Buffer.from('admin:test-secret').toString('base64');
      const response = await request(app)
        .get('/health')
        .set('Authorization', `Basic ${auth}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });
});

// Version Check
describe('Integration Tests', () => {
  describe('GET /version', () => {
    it('should return the current version from package.json', async () => {
      // Read expected version dynamically to ensure test validity over time
      const packagePath = path.resolve(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      const expectedVersion = packageJson.version;

      const auth = Buffer.from('admin:test-secret').toString('base64');
      const response = await request(app)
        .get('/version')
        .set('Authorization', `Basic ${auth}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ version: expectedVersion });
    });
  });
});

// Metrics Check
describe('Integration Tests', () => {
  describe('GET /metrics', () => {
    it('should return 200 OK', async () => {
      const auth = Buffer.from('admin:test-secret').toString('base64');
      const response = await request(app)
        .get('/metrics')
        .set('Authorization', `Basic ${auth}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeTypeOf('object');
    });
  });
});

// Basic Auth Check
describe('Integration Tests', () => {
  describe('GET /health without auth', () => {
    it('should return 401 Unauthorized', async () => {
      const response = await request(app)
        .get('/health');
      expect(response.status).toBe(401);
    });
  });
});

describe('Integration Tests', () => {
  describe('GET /health with wrong auth type', () => {
    it('should return 401 Unauthorized', async () => {
      const response = await request(app)
        .get('/health')
        .set('Authorization', 'Invalid test-secret');
      expect(response.status).toBe(401);
    });
  });
});

describe('Integration Tests', () => {
  describe('GET /health with wrong bearer secret', () => {
    it('should return 401 Unauthorized', async () => {
      const response = await request(app)
        .get('/health')
        .set('Authorization', 'Basic wrong-secret');
      expect(response.status).toBe(401);
    });
  });
});