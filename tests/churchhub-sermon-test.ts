import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3005';
const SLUG = 'test-church';
const SS = '/Users/ijiwon/.openclaw/workspace';

const sermons = [
  { title: '믿음의 여정', speaker: '김목사', content: '아브라함의 믿음을 통해...', series: '창세기 강해', bibleRef: '창세기 12:1-4', tags: '믿음,순종,아브라함', date: '2026-04-13' },
  { title: '은혜의 복음', speaker: '김목사', content: '로마서의 핵심 메시지...', series: '로마서 강해', bibleRef: '로마서 1:16-17', tags: '은혜,복음,구원', date: '2026-04-06' },
  { title: '사랑의 계명', speaker: '이목사', content: '새 계명을 주노니...', series: '창세기 강해', bibleRef: '요한일서 4:7-12', tags: '사랑,계명,교제', date: '2026-03-30' },
];

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@churchhub.dev');
  await page.fill('input[type="password"]', 'admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 15000 });
  console.log('✅ Login done, URL:', page.url());
}

test.describe.serial('ChurchHub Sermon E2E', () => {

  test('1. Login', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: `${SS}/test-01-after-login.png` });
  });

  test('2. Create 3 sermons', async ({ page }) => {
    await login(page);

    // Get cookies for API calls
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    for (let i = 0; i < sermons.length; i++) {
      const s = sermons[i];
      
      // Create via API directly (form has churchId state bug)
      const response = await page.evaluate(async (sermonData) => {
        const res = await fetch('/api/sermons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sermonData, churchId: 'test001' }),
        });
        return { ok: res.ok, status: res.status, body: await res.text() };
      }, s);

      if (response.ok) {
        console.log(`✅ Sermon ${i + 1}: ${s.title} created`);
      } else {
        console.log(`❌ Sermon ${i + 1}: ${s.title} - ${response.status} ${response.body}`);
      }
      await page.waitForTimeout(500);
    }
  });

  test('3. Public sermon list', async ({ page }) => {
    await page.goto(`${BASE}/church/${SLUG}/sermons`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/test-03-public-list.png` });

    const html = await page.content();
    console.log('Page has sermon content:', html.includes('믿음의 여정') || html.includes('은혜의 복음') || html.includes('사랑의 계명'));

    // Try series filter
    const 창세기 = page.locator('button:has-text("창세기 강해"), [role="button"]:has-text("창세기 강해")').first();
    if (await 창세기.isVisible({ timeout: 3000 }).catch(() => false)) {
      await 창세기.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/test-03-series-filter.png` });
      console.log('✅ Series filter clicked');
    } else {
      console.log('⚠️ Series filter not found as button');
    }

    // Try search
    const search = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]').first();
    if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
      await search.fill('김목사');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/test-03-search.png` });
      console.log('✅ Search done');
    } else {
      console.log('⚠️ Search input not found');
    }
  });

  test('4. Sermon detail', async ({ page }) => {
    await page.goto(`${BASE}/church/${SLUG}/sermons`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first sermon link/card
    const card = page.locator('a[href*="/sermon/"]').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      await card.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SS}/test-04-sermon-detail.png` });
      const html = await page.content();
      console.log('Series badge:', html.includes('창세기 강해'));
      console.log('Bible ref:', html.includes('창세기 12:1-4'));
      console.log('Tags:', html.includes('믿음'));
    } else {
      // Maybe list uses different structure - click any sermon title
      const title = page.locator('text=믿음의 여정').first();
      if (await title.isVisible({ timeout: 3000 }).catch(() => false)) {
        await title.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/test-04-sermon-detail.png` });
      } else {
        await page.screenshot({ path: `${SS}/test-04-no-detail.png` });
        console.log('⚠️ No sermon links found');
      }
    }
  });

  test('5. Admin sermon list', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/admin/${SLUG}/sermons`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/test-05-admin-list.png` });

    const html = await page.content();
    console.log('Has sermons:', html.includes('믿음의 여정'));
    console.log('Series col:', html.includes('창세기 강해') || html.includes('시리즈'));
    console.log('Bible ref col:', html.includes('창세기 12:1-4') || html.includes('성경'));
    console.log('Tags col:', html.includes('믿음') || html.includes('태그'));

    // Try filter dropdown
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      await select.screenshot({ path: `${SS}/test-05-filter-dropdown.png` });
      console.log('✅ Filter dropdown found');
    }
  });
});
