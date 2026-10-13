import { test, expect } from '@playwright/test';

test.describe('4Bloods Section 03: 3D Showroom In-Game Apparel Carousel', () => {
  test('Renders lightweight apparel carousel, tests categories, and modal inspection', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Scroll to #wardrobe
    const wardrobeSection = page.locator('#wardrobe');
    await expect(wardrobeSection).toBeAttached();
    await wardrobeSection.scrollIntoViewIfNeeded();

    // Verify Title & Sub-header
    await expect(page.getByText('SECTION // 03 — APPAREL CODEX')).toBeVisible();
    await expect(page.getByText(/CUSTOM DRIP ARCHIVE & WARDROBE/i)).toBeVisible();

    // Verify real in-game 4Bloods clothes are rendered
    await expect(page.getByText('4BLOODS SIGNATURE RED HOODIE V1')).toBeVisible();
    await expect(page.getByText('4BLOODS FLAMING SKULL RED HOODIE V2')).toBeVisible();
    await expect(page.getByText('4BLOODS NIGHT OPS BLACK HOODIE')).toBeVisible();
    await expect(page.getByText('4BG DICKIES WORKSHIRT — BLACK EDITION')).toBeVisible();

    // Test Category Filter
    const hoodiesFilterBtn = page.getByRole('button', { name: /HOODIES/i });
    await hoodiesFilterBtn.click();
    await expect(page.getByText('4BLOODS SIGNATURE RED HOODIE V1')).toBeVisible();

    // Reset to ALL PIECES
    const allPiecesBtn = page.getByRole('button', { name: /ALL PIECES/i });
    await allPiecesBtn.click();
    await expect(page.getByText('4BG DICKIES WORKSHIRT — BLACK EDITION')).toBeVisible();

    // Test Flip View button on Dickies Workshirt or items with back image
    const flipBtn = page.locator('button:has-text("BELAKANG")').first();
    if (await flipBtn.isVisible()) {
      await flipBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('button:has-text("DEPAN")').first()).toBeVisible();
    }

    // Test Inspect Modal on Signature Red Hoodie
    const hoodieCard = page.getByText('4BLOODS SIGNATURE RED HOODIE V1');
    await hoodieCard.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('4BG APPAREL ARCHIVE')).toBeVisible();
    await expect(page.getByText('SPESIFIKASI IN-GAME MESH & MATERIAL:')).toBeVisible();

    // Close Modal
    const closeBtn = page.locator('div[role="dialog"] button').first();
    await closeBtn.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
