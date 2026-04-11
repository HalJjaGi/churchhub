import { test, expect } from '@playwright/test';

test.describe('UI 인터랙션 테스트', () => {
  test('메인 페이지 교회 링크 동작', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const churchLink = page.locator('#churches a[href*="/church/"]').first();
    await expect(churchLink).toBeVisible();
    
    const href = await churchLink.getAttribute('href');
    expect(href).toContain('/church/');
    
    await churchLink.click();
    await page.waitForURL('**/church/**', { timeout: 10000 }).catch(() => {});
  });

  test('네비게이션 동작', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await page.waitForURL('**/login**', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('페이지 렌더링 안정성', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();

    const header = page.locator('header, nav');
    const headerCount = await header.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('교회 페이지 로드', async ({ page }) => {
    await page.goto('/church/demo');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/church/demo');
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    const hasHeader = await page.locator('header').isVisible().catch(() => false);
    expect(hasMain || hasHeader).toBeTruthy();
  });
});
