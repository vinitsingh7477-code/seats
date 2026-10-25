import { expect, test } from '@playwright/test';

function localDateInputValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test('home route search carries date and reversed route into clearly labelled demo results', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Your next move starts here/ })).toBeVisible();
  await expect(page.locator('header .brand-symbol')).toBeVisible();
  expect((await page.locator('header .brand-symbol').boundingBox())?.height).toBeGreaterThanOrEqual(36);
  await expect(page.getByRole('heading', { name: 'Where to next?' })).toBeVisible();
  await expect(page.getByText(/Airline inventory is not connected/)).toBeVisible();
  await page.getByRole('button', { name: 'Swap origin and destination' }).click();
  await page.getByLabel('Departure').first().fill(localDateInputValue());
  await page.getByRole('button', { name: 'Explore route options' }).click();
  await expect(page).toHaveURL(/\/search\?origin=DEL&destination=IDR/);
  await expect(page.getByText(/Demo data — not live airline availability/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review plans' }).first()).toBeVisible();
  await expect(page.getByText(/₹|\$\d/)).toHaveCount(0);
});

test('destination chips select and search the matching city pair', async ({ page }) => {
  await page.goto('/');
  const mumbaiChip = page.getByRole('button', { name: 'Mumbai (BOM)' });
  await mumbaiChip.focus();
  await mumbaiChip.press('Enter');
  await expect(page.locator('.hero-route-destination strong')).toHaveText('Mumbai');
  await expect(mumbaiChip).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Explore route options' }).click();
  await expect(page).toHaveURL(/\/search\?origin=IDR&destination=BOM/);
  await expect(page.getByText(/Indore to Mumbai/)).toBeVisible();
  await expect(page.locator('.schedule-card')).toHaveCount(2);
});

test('layout remains within narrow mobile through wide desktop widths', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: /A route to consider/ })).toBeVisible();
    await expect(page.locator('header .brand-symbol')).toBeVisible();
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

test('demo journey carries a route through plans, membership and standby without claiming a booking', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Swap origin and destination' }).click();
  await page.getByLabel('Departure').first().fill(localDateInputValue());
  await page.getByRole('button', { name: 'Explore route options' }).click();
  await expect(page).toHaveURL(/\/search\?origin=DEL/);
  await expect(page.getByText(/Demo data — not live airline availability/)).toBeVisible();
  await page.getByRole('link', { name: 'Review plans' }).first().click();
  await expect(page).toHaveURL(/\/plans\?/);
  await page.getByRole('link', { name: 'Select for demo' }).nth(1).click();
  await expect(page).toHaveURL(/\/membership\?/);
  await expect(page.getByText('DEMO · NOT ACTIVE')).toBeVisible();
  await page.getByRole('link', { name: 'View standby journey' }).click();
  await page.getByRole('button', { name: 'Create local demo request' }).click();
  await expect(page.getByText(/Demo request recorded in this browser/)).toBeVisible();
  await expect(page.getByText(/No booking or ticket/)).toBeVisible();
});

test('new product pages fit small screens and disclose draft or demo behavior', async ({ page }) => {
  for (const [path, heading] of [['/how-it-works', 'How standby could work'], ['/faq', 'Frequently asked questions'], ['/contact', 'Contact and support'], ['/privacy', 'Privacy information'], ['/terms', 'Terms of use'], ['/login', 'Sign in to SEATS'], ['/signup', 'Create a SEATS account']] as const) {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBe(false);
  }
});
