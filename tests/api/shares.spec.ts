import { expect, test } from '@playwright/test';
import { env } from '../../fixtures/env';

test.describe('Read-only public sharing API', () => {
  test('owner can issue a public link, guests can read it, and revoke removes access', async ({
    request,
  }) => {
    const login = await request.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.owner.email, password: env.owner.password },
    });
    const { accessToken } = await login.json();
    const auth = { Authorization: `Bearer ${accessToken}` };

    const rooms = await request.get(`${env.apiUrl}/data-rooms`, { headers: auth });
    const dataRoomId = (await rooms.json()).items[0].id as string;

    const folderName = `API_Share_${Date.now()}`;
    const created = await request.post(`${env.apiUrl}/folders`, {
      headers: auth,
      data: { name: folderName, dataRoomId },
    });
    const folder = await created.json();

    const share = await request.post(`${env.apiUrl}/shares`, {
      headers: auth,
      data: {
        resourceType: 'FOLDER',
        resourceId: folder.id,
        mode: 'PUBLIC_LINK',
      },
    });
    expect(share.status()).toBe(201);
    const shareBody = await share.json();
    expect(shareBody.token).toEqual(expect.any(String));

    const publicView = await request.get(`${env.apiUrl}/public/${shareBody.token}`);
    expect(publicView.status()).toBe(200);
    const summary = await publicView.json();
    expect(summary.resourceType).toBe('FOLDER');
    expect(summary.resourceId).toBe(folder.id);
    expect(summary.resourceName).toBe(folderName);

    const revoked = await request.delete(`${env.apiUrl}/shares/${shareBody.id}`, { headers: auth });
    expect(revoked.status()).toBe(204);

    const afterRevoke = await request.get(`${env.apiUrl}/public/${shareBody.token}`);
    expect(afterRevoke.status()).toBe(410);

    await request.delete(`${env.apiUrl}/folders/${folder.id}`, { headers: auth });
  });
});
