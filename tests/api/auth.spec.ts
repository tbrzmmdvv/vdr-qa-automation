import { expect, test } from '@playwright/test';
import { env } from '../../fixtures/env';

test.describe('Auth API', () => {
  test('login with valid owner credentials returns a JWT', async ({ request }) => {
    const response = await request.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.owner.email, password: env.owner.password },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.accessToken.split('.')).toHaveLength(3);
  });

  test('login with a wrong password is rejected', async ({ request }) => {
    const response = await request.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.owner.email, password: 'not-the-password' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.statusCode).toBe(401);
    expect(body.message).toMatch(/invalid email or password/i);
  });

  test('GET /auth/me returns the authenticated owner', async ({ request }) => {
    const login = await request.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.owner.email, password: env.owner.password },
    });
    const { accessToken } = await login.json();

    const me = await request.get(`${env.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(me.status()).toBe(200);
    const body = await me.json();
    expect(body.email).toBe(env.owner.email);
    expect(body.name).toBe(env.owner.name);
    expect(body.id).toEqual(expect.any(String));
  });
});
