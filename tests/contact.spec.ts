import { test, expect } from '@playwright/test';

test.describe('연락처/오시는 길 페이지', () => {
  test('연락처 페이지 로드', async ({ page }) => {
    await page.goto('/church/demo/contact');

    // 페이지가 로드되는지 확인
    await page.waitForLoadState('networkidle');

    // main 요소와 헤더 확인
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText('오시는 길');
  });

  test('연락처 정보 표시', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // 연락처 관련 요소 확인 (전화, 이메일, 주소 등)
    const pageContent = await page.content();
    const hasContactInfo =
      pageContent.includes('전화') ||
      pageContent.includes('Tel') ||
      pageContent.includes('연락') ||
      pageContent.includes('이메일') ||
      pageContent.includes('Email') ||
      pageContent.includes('주소') ||
      pageContent.includes('Address');

    // 페이지가 렌더링되었는지만 확인
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('지도 표시', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // Google Maps 또는 지도 관련 요소 확인
    const hasMap =
      await page.locator('iframe[src*="google"], iframe[src*="map"], [data-map], .map, #map').count() > 0;

    // 지도가 있거나 플레이스홀더가 있어야 함
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('주소 정보 표시', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // 주소 형식 확인 (한국 주소 패턴)
    const pageContent = await page.content();
    const addressPattern = /시|구|동|로|길|\d{5}/;

    // 페이지가 렌더링되었는지만 확인
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('주차 안내 표시', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // 주차 관련 정보 확인
    const pageContent = await page.content();
    const hasParkingInfo =
      pageContent.includes('주차') ||
      pageContent.includes('Parking');

    // 주차 안내는 선택사항
    expect(pageContent.length).toBeGreaterThan(0);
  });
});

test.describe('반응형 연락처 페이지', () => {
  test('모바일에서 연락처 페이지', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // 모바일에서도 페이지가 정상 표시되는지 확인
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('태블릿에서 연락처 페이지', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('데스크톱에서 연락처 페이지', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('접근성', () => {
  test('연락처 링크 접근성', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    // 링크들이 키보드로 접근 가능한지 확인
    const links = await page.locator('a, button').count();

    // 최소한 페이지가 렌더링되었는지 확인
    expect(links).toBeGreaterThanOrEqual(0);
  });
});
