import { expect, test } from '@playwright/test';
import { env } from '../../fixtures/env';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Authentication UI', () => {
  test('owner can sign in and reach the data room', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsOwner(env.owner.email, env.owner.password);

    await expect(page.getByText(env.owner.name)).toBeVisible();
    await expect(page.getByRole('link', { name: 'My data rooms' })).toBeVisible();
  });

  test('invalid credentials stay on the sign-in page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(env.owner.email, 'wrong-password');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
