import path from 'path';
import { test } from '@playwright/test';
import { env } from '../../fixtures/env';
import { DataRoomPage } from '../../pages/DataRoomPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Virtual Data Room - core E2E flow', () => {
  test('owner can create a folder, open it, and upload a PDF', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dataRoom = new DataRoomPage(page);
    const folderName = `QA_Folder_${Date.now()}`;
    const samplePdf = path.join(__dirname, '../../assets/sample.pdf');

    await loginPage.goto();
    await loginPage.loginAsOwner(env.owner.email, env.owner.password);

    await dataRoom.createFolder(folderName);
    await dataRoom.openItem(folderName);

    await dataRoom.uploadFile(samplePdf);
    await dataRoom.expectItemVisible('sample.pdf');

    await page.getByRole('link', { name: 'My data rooms' }).click();
    await dataRoom.deleteItem(folderName);
  });
});
