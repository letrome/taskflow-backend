import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/app.js';

describe('Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });
});
