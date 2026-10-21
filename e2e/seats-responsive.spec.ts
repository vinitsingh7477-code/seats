import { expect, test } from '@playwright/test';

function localDateInputValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test('desktop route search filters only explicitly labelled local schedules', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Make flexibility part of the plan/ })).toBeVisible();
  await expect(page.getByText('DEMONSTRATION ONLY')).toBeVisible();
  await page.getByLabel('Travel date').fill(localDateInputValue());
  await page.getByLabel('Date flexibility').selectOption('exact');
  await page.getByRole('button', { name: 'Find demo schedules' }).click();

  await expect(page.locator('.result-count')).toContainText('2 illustrative schedules match this local search');
  await expect(page.locator('.flight-card')).toHaveCount(2);
  await expect(page.getByText('Availability not connected').first()).toBeVisible();
  await expect(page.getByText(/₹|\$\d/)).toHaveCount(0);
});

test('layout remains within narrow mobile through wide desktop widths', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: /A route to consider/ })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
  }
});

test('mobile navigation supports keyboard dismissal and opens the customer account route', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
  await menuButton.click();
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNavigation).toHaveAttribute('aria-hidden', 'false');
  await page.getByRole('button', { name: 'Close navigation menu' }).press('Escape');
  await expect(page.locator('#mobile-navigation')).toHaveAttribute('aria-hidden', 'true');

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'My account' }).click();
  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'My travel.' })).toBeVisible();
  await expect(page.getByText(/Supabase is not configured/i)).toBeVisible();
});

test('admin route fails closed while Supabase is unconfigured', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#/admin');
  await expect(page.getByText('Operations data is unavailable')).toBeVisible();
  await expect(page.getByText(/No request or inventory data has been loaded/i)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Database-derived operational metrics' })).toHaveCount(0);
});
