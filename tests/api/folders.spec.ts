import { expect, test } from '@playwright/test';
import { env } from '../../fixtures/env';

test.describe('Folder lifecycle API', () => {
  test('owner can create, list, and delete a folder', async ({ request }) => {
    const login = await request.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.owner.email, password: env.owner.password },
    });
    const { accessToken } = await login.json();
    const auth = { Authorization: `Bearer ${accessToken}` };

    const rooms = await request.get(`${env.apiUrl}/data-rooms`, { headers: auth });
    expect(rooms.status()).toBe(200);
    const roomPage = await rooms.json();
    expect(roomPage.items.length).toBeGreaterThan(0);
    const dataRoomId = roomPage.items[0].id as string;

    const folderName = `API_Folder_${Date.now()}`;
    const created = await request.post(`${env.apiUrl}/folders`, {
      headers: auth,
      data: { name: folderName, dataRoomId },
    });

    expect(created.status()).toBe(201);
    const folder = await created.json();
    expect(folder.name).toBe(folderName);
    expect(folder.dataRoomId).toBe(dataRoomId);

    const contents = await request.get(`${env.apiUrl}/data-rooms/${dataRoomId}/contents?limit=100`, {
      headers: auth,
    });
    expect(contents.status()).toBe(200);
    const listed = await contents.json();
    expect(listed.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'folder', id: folder.id, name: folderName }),
      ]),
    );

    const deleted = await request.delete(`${env.apiUrl}/folders/${folder.id}`, { headers: auth });
    expect(deleted.status()).toBe(204);
  });
});
