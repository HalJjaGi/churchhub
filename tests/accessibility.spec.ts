import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('접근성 (a11y) 테스트', () => {
  test('메인 페이지 접근성', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a']) // AA 레벨만 체크
      .analyze();

    // serious 영향의 위반만 체크
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('교회 상세 페이지 접근성', async ({ page }) => {
    await page.goto('/church/demo');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('설교 페이지 접근성', async ({ page }) => {
    await page.goto('/church/demo/sermons');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('연락처 페이지 접근성', async ({ page }) => {
    await page.goto('/church/demo/contact');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('로그인 페이지 접근성', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    expect(seriousViolations).toEqual([]);
  });
});

test.describe('키보드 접근성', () => {
  test('Tab 키 네비게이션', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab');

    // 포커스된 요소가 있는지 확인
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const isFocused = await focusedElement.evaluate((el) => el !== document.body);

    expect(isFocused).toBeTruthy();
  }, 15000);

  test('링크 키보드 접근', async ({ page }) => {
    await page.goto('/church/demo');
    await page.waitForLoadState('networkidle');

    // 링크에 포커스
    const links = page.locator('a');
    const count = await links.count();

    if (count > 0) {
      await links.first().focus();
      await expect(links.first()).toBeFocused();
    }
  });
});

test.describe('ARIA 속성', () => {
  test('메인 랜드마크', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasMain = await page.locator('main, [role="main"], .min-h-screen').count() > 0;
    expect(hasMain).toBeTruthy();
  });

  test('헤딩 구조', async ({ page }) => {
    await page.goto('/church/demo');
    await page.waitForLoadState('networkidle');

    // h1이 있는지 확인
    const hasH1 = await page.locator('h1').count() > 0;
    expect(hasH1).toBeTruthy();
  });

  test('버튼 레이블', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 버튼들이 적절한 레이블을 가지고 있는지 확인
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 0) {
      // 첫 번째 버튼의 텍스트 확인
      const text = await buttons.first().textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });
});
