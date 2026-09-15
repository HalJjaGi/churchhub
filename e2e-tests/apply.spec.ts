import { test, expect } from '@playwright/test';

test('ChurchHub 신청 페이지 모든 요소 테스트', async ({ page }) => {
  await page.goto('https://churchhub.co.kr/apply');
  await page.waitForLoadState('networkidle');
  
  // 페이지 제목 확인
  await expect(page.locator('h1:has-text("교회 웹사이트 신청")')).toBeVisible();
  
  // 서비스 소개 확인
  await expect(page.locator('h2:has-text("왜 ChurchHub인가요?")')).toBeVisible();
  
  // 4단계 프로세스 확인
  expect(await page.locator('h2:has-text("교회 기본 정보")').count()).toBe(1);
  expect(await page.locator('h2:has-text("교회 상세 정보")').count()).toBe(1);
  expect(await page.locator('h2:has-text("테마 선택")').count()).toBe(1);
  expect(await page.locator('h2:has-text("약관 동의")').count()).toBe(1);
  
  // 필수 입력 필드 확인
  await expect(page.locator('input[name="churchName"]')).toBeVisible();
  await expect(page.locator('input[name="pastorName"]')).toBeVisible();
  await expect(page.locator('input[name="contactPhone"]')).toBeVisible();
  await expect(page.locator('input[name="contactEmail"]')).toBeVisible();
  await expect(page.locator('input[name="address"]')).toBeVisible();
  
  // 테마 선택 확인
  await expect(page.locator('input[name="theme"]')).toHaveCount(3);
  
  // 약관 동의 확인
  await expect(page.locator('input[name="agreeTerms"]')).toBeVisible();
  await expect(page.locator('input[name="agreePrivacy"]')).toBeVisible();
  await expect(page.locator('input[name="agreeMarketing"]')).toBeVisible();
  
  // 제출 버튼 확인
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText(/교회 신청하기/);
  
  // 고객지원 정보 확인
  await expect(page.locator('.text-center:has-text("070-8065-7623")')).toBeVisible();
  await expect(page.locator('.text-center:has-text("support@churchhub.co.kr")')).toBeVisible();
  
  console.log('✅ ChurchHub 신청 페이지 모든 요소 테스트 통과!');
});
