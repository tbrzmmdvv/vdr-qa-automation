import { expect, test } from '@playwright/test';
import { env } from '../../fixtures/env';

test.describe('API liveness', () => {
  test('GET /health returns 200 and status ok without auth', async ({ request }) => {
    const response = await request.get(`${env.apiUrl}/health`);

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
