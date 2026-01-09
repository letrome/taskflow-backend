import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { getHealth, getVersion, getMetrics } from '../../src/controllers/admin.js';

describe('getHealth', () => {
  it('should return a body with status ok', () => {
    const request = {} as Request;
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    getHealth(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: 'OK' });
  });
});

describe('getVersion', () => {
  it('should return the version in the package.json', () => {
    const request = {} as Request;
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    getVersion(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ version: expect.stringMatching(/^\d+\.\d+\.\d+$/) });
  });
});

describe('getMetrics', () => {
  it('should return the metrics', async () => {
    const request = {} as Request;
    const response = {
      set: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response;

    await getMetrics(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalled();
  });
});
