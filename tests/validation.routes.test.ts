import type { FastifyInstance } from 'fastify';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('Validation error contract', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  const expectInvalidInput = (payload: unknown) => {
    expect(payload).toMatchObject({
      error: 'Invalid input',
      error_code: 'INVALID_INPUT'
    });
    expect(Array.isArray((payload as { issues?: unknown[] }).issues)).toBe(true);
    expect(((payload as { issues?: unknown[] }).issues ?? []).length).toBeGreaterThan(0);
  };

  it('returns contract for invalid employee payloads', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: {}
    });

    expect(response.statusCode).toBe(400);
    expectInvalidInput(response.json());
  });

  it('returns contract for invalid vehicle payloads', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/vehicles',
      payload: {}
    });

    expect(response.statusCode).toBe(400);
    expectInvalidInput(response.json());
  });
});
