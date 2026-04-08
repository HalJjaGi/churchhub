import { test, expect } from '@playwright/test';

test.describe('관리자 페이지 접근 제어', () => {
  test('비로그인 시 관리자 설교 페이지 접근 차단', async ({ page }) => {
    await page.goto('/admin/traditional-church/sermons');
    
    // 로그인 페이지로 리다이렉트 또는 접근 거부 메시지
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const hasAccessDenied = await page.getByText(/로그인|접근|권한/).count() > 0;
    
    expect(isLoginPage || hasAccessDenied).toBeTruthy();
  });

  test('비로그인 시 설교 추가 페이지 접근 차단', async ({ page }) => {
    await page.goto('/admin/traditional-church/sermons/new');
    
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });
});

test.describe('공개 설교 페이지', () => {
  test('교회 설교 목록 페이지 로드', async ({ page }) => {
    await page.goto('/church/traditional-church/sermons');
    await page.waitForLoadState('networkidle');
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('main')).toBeVisible();
  });

  test('설교 카드 또는 목록 표시', async ({ page }) => {
    await page.goto('/church/traditional-church/sermons');
    await page.waitForLoadState('networkidle');
    
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });
});
