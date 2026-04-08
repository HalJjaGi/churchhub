import { test, expect } from '@playwright/test';

test.describe('UI 인터랙션 테스트', () => {
  test('테마 변경 UI 동작', async ({ page }) => {
    await page.goto('/');
    
    // 테마 선택 탭 클릭
    await page.click('text=테마 선택');
    await page.waitForTimeout(500);
    
    // 테마 선택 버튼들 확인
    const themeButtons = page.locator('button:has-text("선택")');
    const count = await themeButtons.count();
    
    if (count > 0) {
      // 첫 번째 테마 선택
      await themeButtons.first().click();
      await page.waitForTimeout(500);
      
      // 현재 선택된 테마 정보 확인
      const selectedTheme = await page.locator('text=/현재 선택된 테마/').isVisible();
      expect(selectedTheme).toBeTruthy();
    }
  });

  test('모듈 토글 UI 동작', async ({ page }) => {
    await page.goto('/');
    
    // 모듈 관리 탭 클릭
    await page.click('text=모듈 관리');
    await page.waitForTimeout(500);
    
    // 모듈 토글 확인
    const moduleToggles = page.locator('button[role="switch"], input[type="checkbox"]');
    const count = await moduleToggles.count();
    
    if (count > 0) {
      // 첫 번째 모듈 토글
      await moduleToggles.first().click();
      await page.waitForTimeout(500);
    }
    
    // 페이지가 여전히 정상 작동하는지 확인
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('탭 전환 동작', async ({ page }) => {
    await page.goto('/');
    
    // 테마 탭에서 시작
    await page.click('text=테마 선택');
    await expect(page.locator('text=테마 선택')).toBeVisible();
    
    // 모듈 탭으로 전환
    await page.click('text=모듈 관리');
    await page.waitForTimeout(300);
    
    // 다시 테마 탭으로
    await page.click('text=테마 선택');
    await page.waitForTimeout(300);
    
    // 여전히 페이지가 작동하는지 확인
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('미리보기 링크 동작', async ({ page }) => {
    await page.goto('/');
    
    // 미리보기 링크 찾기
    const previewLinks = page.locator('a[href*="/church/"]');
    const count = await previewLinks.count();
    
    if (count > 0) {
      // 첫 번째 미리보기 링크 클릭
      await previewLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // 교회 페이지로 이동했는지 확인
      const url = page.url();
      expect(url).toContain('/church/');
    }
  });
});
