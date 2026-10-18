import { expect, type Locator, type Page } from '@playwright/test';

export class DataRoomPage {
  readonly page: Page;
  readonly newFolderButton: Locator;
  readonly uploadButton: Locator;
  readonly shareButton: Locator;
  readonly folderNameInput: Locator;
  readonly createButton: Locator;
  readonly fileInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newFolderButton = page.getByRole('button', { name: 'New folder' });
    this.uploadButton = page.getByRole('button', { name: 'Upload' });
    this.shareButton = page.getByRole('button', { name: 'Share' });
    this.folderNameInput = page.getByRole('textbox', { name: 'Folder name' });
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.fileInput = page.locator('input[type="file"]');
  }

  itemRow(name: string) {
    return this.page.getByRole('row', { name: new RegExp(escapeRegExp(name)) });
  }

  async createFolder(folderName: string) {
    await this.newFolderButton.click();
    await expect(this.page.getByRole('heading', { name: 'New folder' })).toBeVisible();
    await this.folderNameInput.fill(folderName);
    await this.createButton.click();
    await expect(this.itemRow(folderName)).toBeVisible();
  }

  async openItem(name: string) {
    await this.itemRow(name).click();
  }

  async uploadFile(filePath: string) {
    const completed = this.page.waitForResponse(
      (response) =>
        response.url().includes('/files/') &&
        response.url().includes('/complete') &&
        response.ok(),
      { timeout: 30_000 },
    );

    const chooserPromise = this.page.waitForEvent('filechooser', { timeout: 5_000 });
    await this.uploadButton.first().click();

    try {
      const chooser = await chooserPromise;
      await chooser.setFiles(filePath);
    } catch {
      await this.fileInput.first().setInputFiles(filePath);
    }

    await completed;
  }

  async expectItemVisible(name: string) {
    await expect(this.itemRow(name)).toBeVisible();
  }

  async deleteItem(name: string) {
    await this.page.getByRole('button', { name: `Actions for ${name}` }).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirm = this.page.getByRole('button', { name: /delete|confirm|remove/i });
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirm.click();
    }

    await expect(this.itemRow(name)).toHaveCount(0);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
