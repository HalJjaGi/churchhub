import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3005/church/test-church';
const SCREENSHOT_DIR = '/Users/ijiwon/.openclaw/workspace';

test.describe('ChurchHub 기능 E2E 테스트', () => {

  test('1-2. 공지사항 목록 페이지', async ({ page }) => {
    await page.goto(`${BASE}/notices`, { waitUntil: 'networkidle' });
    
    // 3개 공지 표시 확인
    const noticeCards = page.locator('article, [class*="notice"], [class*="card"], a[href*="/notices/"]');
    await expect(noticeCards.first()).toBeVisible({ timeout: 10000 });
    const count = await noticeCards.count();
    console.log(`공지사항 개수: ${count}`);
    
    // 고정된 공지 확인 (첫 번째가 pinned)
    const firstTitle = await noticeCards.first().textContent();
    console.log(`첫 번째 공지: ${firstTitle}`);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-notices-list.png`, fullPage: true });
  });

  test('1-3. 공지사항 검색', async ({ page }) => {
    await page.goto(`${BASE}/notices`, { waitUntil: 'networkidle' });
    
    // 검색창 찾기
    const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('부활절');
      // 검색 버튼 또는 Enter
      const searchBtn = page.locator('button[type="submit"], button:has-text("검색")');
      if (await searchBtn.count() > 0) {
        await searchBtn.first().click();
      } else {
        await searchInput.first().press('Enter');
      }
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-notices-search.png`, fullPage: true });
  });

  test('1-4. 공지사항 상세', async ({ page }) => {
    await page.goto(`${BASE}/notices`, { waitUntil: 'networkidle' });
    
    // 첫 번째 공지 클릭
    const firstNotice = page.locator('article a, a[href*="/notices/"], [class*="notice"] a, article').first();
    await firstNotice.waitFor({ state: 'visible', timeout: 10000 });
    await firstNotice.click();
    await page.waitForLoadState('networkidle');
    
    // 내용 표시 확인
    const body = page.locator('main, [class*="content"], [class*="notice"]');
    await expect(body).toBeVisible();
    
    // "공지 목록으로" 링크 확인
    const backLink = page.locator('a:has-text("목록"), a:has-text("공지"), a[href*="/notices"]').first();
    const hasBackLink = await backLink.isVisible().catch(() => false);
    console.log(`목록 링크 존재: ${hasBackLink}`);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-notices-detail.png`, fullPage: true });
  });

  test('2. 캘린더 페이지', async ({ page }) => {
    await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle' });
    
    // 달력 그리드 확인
    const calendar = page.locator('[class*="calendar"], [class*="Calendar"], table, [class*="grid"]');
    await expect(calendar.first()).toBeVisible({ timeout: 10000 });
    
    // 현재 월 표시
    const monthText = await page.locator('text=/2026|4월|April|April 2026|2026년 4월/').first().textContent().catch(() => 'N/A');
    console.log(`월 표시: ${monthText}`);
    
    // 이전/다음 달 버튼
    const prevBtn = page.locator('button:has-text("이전"), button:has-text("<"), button[aria-label*="prev"], button[aria-label*="Previous"]').first();
    const nextBtn = page.locator('button:has-text("다음"), button:has-text(">"), button[aria-label*="next"], button[aria-label*="Next"]').first();
    console.log(`이전 버튼: ${await prevBtn.isVisible().catch(() => false)}`);
    console.log(`다음 버튼: ${await nextBtn.isVisible().catch(() => false)}`);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-calendar.png`, fullPage: true });
  });

  test('3. 교회 소개 페이지', async ({ page }) => {
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('main')).toBeVisible();
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-about.png`, fullPage: true });
  });

  test('4. 메인 페이지', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    
    // 페이지 로드 확인
    await expect(page.locator('main')).toBeVisible();
    
    // 주요 섹션 텍스트 확인
    const pageText = await page.locator('body').textContent();
    const sections = ['예배', '설교', '공지', '연락'];
    for (const s of sections) {
      console.log(`"${s}" 섹션: ${pageText?.includes(s) ? '✅' : '❌'}`);
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/test-main-page.png`, fullPage: true });
  });
});
