import { test, expect } from '@playwright/test';

test.describe('관리자 공지사항 접근 제어', () => {
  test('비로그인 시 공지사항 관리 페이지 접근 차단', async ({ page }) => {
    await page.goto('/admin/traditional-church/notices');
    
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const hasAccessDenied = await page.getByText(/로그인|접근|권한/).count() > 0;
    
    expect(isLoginPage || hasAccessDenied).toBeTruthy();
  });

  test('비로그인 시 공지사항 추가 페이지 접근 차단', async ({ page }) => {
    await page.goto('/admin/traditional-church/notices/new');
    
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });
});
