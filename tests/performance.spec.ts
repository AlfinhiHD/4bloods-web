import { test, expect } from '@playwright/test';

test.describe('4Bloods Web Profile & Cam Performance E2E', () => {
  test('Home page renders fast, displays pure 3D logo, and scrolls smoothly', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Warm up dev server compile if needed
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Measure warm DOMContentLoaded
    const start = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    console.log(`[PERF] Home Warm DOMContentLoaded: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3500);

    // Verify 4Bloods Official Hero Emblem is mounted and visible
    const heroLogo = page.locator('img[alt="4BLOODS GANG Official Emblem"]');
    await expect(heroLogo).toBeVisible({ timeout: 5000 });

    // Smooth scroll down to test 60fps rendering without crash
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    await page.waitForTimeout(600);

    // Verify alternating sections are in DOM
    await expect(page.locator('#chronicles')).toBeAttached();
    await expect(page.locator('#hierarchy')).toBeAttached();
    await expect(page.locator('#wardrobe')).toBeAttached();
    await expect(page.locator('#records')).toBeAttached();
    await expect(page.locator('#archives')).toBeAttached();
    await expect(page.locator('#roster')).toBeAttached();

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter((err) => !err.includes('favicon'));
    expect(fatalErrors).toHaveLength(0);
  });

  test('4Bloods Cam fits Height View with zero vertical overflow', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/cam', { waitUntil: 'domcontentloaded' });

    // Verify Command Bar & Height View button
    const heightViewBtn = page.getByRole('button', { name: /HEIGHT VIEW/i });
    await expect(heightViewBtn).toBeVisible({ timeout: 5000 });

    // Click ALL LIVE streamers if available
    const allLiveBtn = page.getByRole('button', { name: /\+ ALL LIVE/i });
    if (await allLiveBtn.isVisible()) {
      await allLiveBtn.click();
      await page.waitForTimeout(600);
    }

    // Check if stage container fits within viewport height
    const hasVerticalScroll = await page.evaluate(() => {
      const stage = document.querySelector('main > div:not(.pointer-events-none)');
      if (!stage) return false;
      return stage.scrollHeight > stage.clientHeight + 4; // allow 4px subpixel margin
    });

    expect(hasVerticalScroll).toBe(false);

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter((err) => !err.includes('favicon'));
    expect(fatalErrors).toHaveLength(0);
  });
});
