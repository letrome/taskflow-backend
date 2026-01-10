import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should verify PORT defaults to 4000 when undefined', async () => {
    delete process.env.PORT;
    const { PORT } = await import('../../src/config.js');
    expect(PORT).toBe(4000);
  });

  it('should verify PORT uses the provided number', async () => {
    process.env.PORT = '5000';
    const { PORT } = await import('../../src/config.js');
    expect(PORT).toBe(5000);
  });

  it('should verify PORT defaults to 4000 for invalid number', async () => {
    process.env.PORT = 'invalid';
    const { PORT } = await import('../../src/config.js');
    expect(PORT).toBe(4000);
  });

  it('should verify PORT defaults to 4000 for negative number', async () => {
    process.env.PORT = '-1';
    const { PORT } = await import('../../src/config.js');
    expect(PORT).toBe(4000);
  });

  it('should verify BASIC_SECRET uses the provided value', async () => {
    process.env.BASIC_SECRET = 'super-secret';
    const { BASIC_SECRET } = await import('../../src/config.js');
    expect(BASIC_SECRET).toBe('super-secret');
  });

  it('should throw error when BASIC_SECRET is undefined', async () => {
    delete process.env.BASIC_SECRET;
    await expect(import('../../src/config.js')).rejects.toThrow('BASIC_SECRET is not defined');
  });
});