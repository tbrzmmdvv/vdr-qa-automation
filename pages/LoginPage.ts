import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAsOwner(email: string, password: string) {
    await this.login(email, password);
    await expect(this.page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'New folder' })).toBeVisible();
  }
}
