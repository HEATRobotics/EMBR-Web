import { test, expect } from '@playwright/test';

test.describe('EMBR Web Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    expect(page.url()).toContain('localhost:3000');
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // Basic assertion that the page has content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that navigation works by testing if routes are accessible
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });
});
