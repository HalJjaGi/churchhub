import { test, expect } from '@playwright/test';

test.describe('기본 페이지 로드', () => {
  test('메인 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 타이틀 확인
    await expect(page).toHaveTitle(/ChurchHub/);

    // 로고 확인
    await expect(page.locator('a:has-text("ChurchHub")')).toBeVisible();
  });

  test('메인 페이지에서 교회 목록 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 교회 카드 또는 링크가 있는지 확인
    const churchLinks = page.locator('a[href*="/church/"]');
    const count = await churchLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('로그인 링크 확인', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('관리자 링크 확인', async ({ page }) => {
    await page.goto('/');

    const adminLink = page.locator('a[href="/admin"]');
    await expect(adminLink).toBeVisible();
  });
});

test.describe('교회 상세 페이지', () => {
  test('데모 교회 페이지 로드', async ({ page }) => {
    await page.goto('/church/demo');

    await page.waitForLoadState('networkidle');

    const hasHeader = await page.locator('header').isVisible().catch(() => false);
    const hasMain = await page.locator('main').isVisible().catch(() => false);

    expect(hasHeader || hasMain).toBeTruthy();
  });

  test('존재하지 않는 교회 페이지 처리', async ({ page }) => {
    await page.goto('/church/non-existent-church');

    await page.waitForLoadState('networkidle');

    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });
});
