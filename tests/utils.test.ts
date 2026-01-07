import { describe, it, expect } from 'vitest';
import { normalizePort } from '../src/utils.js';

describe('normalizePort', () => {
  it('should return default port 3000 when value is undefined', () => {
    expect(normalizePort(undefined)).toBe(3000);
  });

  it('should return the parsed integer when value is a valid number string', () => {
    expect(normalizePort('4000')).toBe(4000);
  });

  it('should return default port when value is not a number', () => {
    expect(normalizePort('invalid')).toBe(3000);
  });

  it('should return default port when value is negative', () => {
    expect(normalizePort('-1')).toBe(3000);
  });
});
