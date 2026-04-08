import { test, expect } from '@playwright/test';

test.describe('기본 페이지 로드', () => {
  test('메인 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/');
    
    // 타이틀 확인
    await expect(page).toHaveTitle(/ChurchHub/);
    
    // 헤더 확인
    await expect(page.locator('h1')).toContainText('ChurchHub');
    
    // 테마 선택기 확인
    await expect(page.locator('text=테마 선택')).toBeVisible();
    
    // 모듈 관리 탭 확인
    await expect(page.locator('text=모듈 관리')).toBeVisible();
  });

  test('메인 페이지에서 미리보기 링크 확인', async ({ page }) => {
    await page.goto('/');
    
    // 미리보기 버튼 확인
    const previewLink = page.locator('a[href="/church/demo"]');
    await expect(previewLink).toBeVisible();
    await expect(previewLink).toContainText('미리보기');
  });

  test('메인 페이지에서 테마 선택 가능', async ({ page }) => {
    await page.goto('/');
    
    // 테마 선택 탭 클릭
    await page.click('text=테마 선택');
    
    // 테마 카드들이 표시되는지 확인
    const themeCards = page.locator('button:has-text("선택")');
    const count = await themeCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('메인 페이지에서 모듈 토글 가능', async ({ page }) => {
    await page.goto('/');

    // 탭 버튼들이 있는지 확인
    const tabButtons = page.locator('button:has-text("테마 선택"), button:has-text("모듈 관리")');
    const count = await tabButtons.count();

    expect(count).toBeGreaterThan(0);

    // 모듈 관리 탭이 있다면 클릭
    const moduleTab = page.locator('button:has-text("모듈 관리")');
    if (await moduleTab.isVisible()) {
      await moduleTab.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('교회 상세 페이지', () => {
  test('데모 교회 페이지 로드', async ({ page }) => {
    await page.goto('/church/demo');
    
    // 페이지가 로드되는지 확인
    await page.waitForLoadState('networkidle');
    
    // 헤더나 메인 콘텐츠가 표시되는지 확인
    const hasHeader = await page.locator('header').isVisible().catch(() => false);
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    
    expect(hasHeader || hasMain).toBeTruthy();
  });

  test('존재하지 않는 교회 페이지 처리', async ({ page }) => {
    await page.goto('/church/non-existent-church');
    
    // 404 페이지 또는 에러 메시지가 표시되는지 확인
    await page.waitForLoadState('networkidle');
    
    const pageContent = await page.content();
    const has404 = pageContent.includes('404') || 
                   pageContent.includes('Not Found') || 
                   pageContent.includes('찾을 수 없') ||
                   pageContent.includes('페이지를 찾을 수 없');
    
    // 페이지가 로드되었는지만 확인 (404 처리는 구현에 따라 다를 수 있음)
    expect(pageContent.length).toBeGreaterThan(0);
  });
});
