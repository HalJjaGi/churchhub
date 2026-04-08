import { test, expect } from '@playwright/test';

test.describe('반응형 테스트', () => {
  test('모바일 뷰 (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 페이지가 로드되는지 확인
    await page.waitForLoadState('networkidle');
    
    // 헤더 또는 메인 콘텐츠 확인
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
    
    // 주요 요소들이 화면에 보이는지 확인
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('태블릿 뷰 (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
    
    // 그리드 레이아웃이 제대로 표시되는지 확인
    const gridItems = await page.locator('button, a, div[class*="grid"]').count();
    expect(gridItems).toBeGreaterThan(0);
  });

  test('데스크톱 뷰 (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
    
    // 전체 레이아웃 확인
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('뷰포트 리사이즈 시 반응형 동작', async ({ page }) => {
    // 데스크톱으로 시작
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 모바일로 리사이즈
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // 리플로우 대기
    
    // 여전히 콘텐츠가 표시되어야 함
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});
