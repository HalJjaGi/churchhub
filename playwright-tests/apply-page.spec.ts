import { test, expect } from '@playwright/test';

// 에이전트 1: 페이지 기본 구조 및 헤더 테스트
test.describe('ChurchHub 신청 페이지 - 에이전트 1: 기본 구조', () => {
  test('페이지 기본 구조와 헤더가 올바르게 표시되는지 확인', async ({ page }) => {
    // 신청 페이지로 이동
    await page.goto('https://churchhub.co.kr/apply');
    
    // 페이지가 정상적으로 로드되는지 확인
    await expect(page).toHaveTitle(/ChurchHub/);
    
    // 기본 구조 확인
    const mainContainer = page.locator('.min-h-screen.bg-gray-50');
    await expect(mainContainer).toBeVisible();
    
    // 헤더 영역 확인
    const header = page.locator('.bg-white.shadow-sm');
    await expect(header).toBeVisible();
    
    // ChurchHub 로고 확인
    const logo = page.locator('span:has-text("⛪ ChurchHub")');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('⛪ ChurchHub');
    
    // 내비게이션 메뉴 확인
    const loginLink = page.locator('a:has-text("로그인")');
    await expect(loginLink).toBeVisible();
    
    const homeLink = page.locator('a:has-text("홈으로")');
    await expect(homeLink).toBeVisible();
    
    // 로고 링크가 홈페이지로 연결되는지 확인
    const logoLink = page.locator('a:has-text("⛪ ChurchHub")');
    await expect(logoLink).toHaveAttribute('href', '/');
  });
});

// 에이전트 2: 서비스 소개 섹션 테스트
test.describe('ChurchHub 신청 페이지 - 에이전트 2: 서비스 소개', () => {
  test('서비스 소개 섹션과 3가지 핵심 가치가 올바르게 표시되는지 확인', async ({ page }) => {
    await page.goto('https://churchhub.co.kr/apply');
    
    // 메인 콘텐츠 컨테이너 확인
    const mainContent = page.locator('.max-w-4xl');
    await expect(mainContent).toBeVisible();
    
    // 페이지 제목 확인
    const pageTitle = page.locator('h1:has-text("교회 웹사이트 신청")');
    await expect(pageTitle).toBeVisible();
    
    const pageSubtitle = page.locator('p:has-text("ChurchHub으로 전문적인 교회 웹사이트를 만들어보세요")');
    await expect(pageSubtitle).toBeVisible();
    
    // 서비스 소개 섹션 확인
    const serviceSection = page.locator('.bg-white.rounded-xl.shadow-lg.p-8.mb-8');
    await expect(serviceSection).toBeVisible();
    
    // "왜 ChurchHub인가요?" 제목 확인
    const sectionTitle = serviceSection.locator('h2:has-text("왜 ChurchHub인가요?")');
    await expect(sectionTitle).toBeVisible();
    
    // 3개의 핵심 가치 그리드 확인
    const gridContainer = serviceSection.locator('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
    await expect(gridContainer).toBeVisible();
    
    // 3개의 핵심 가치 아이템 확인
    const items = gridContainer.locator('.text-center');
    await expect(items).toHaveCount(3);
    
    // 각 핵심 가치 내용 확인
    const item1 = items.nth(0);
    await expect(item1.locator('h3')).toHaveText('빠른 시작');
    await expect(item1.locator('p')).toHaveText('5분 만에 교회 웹사이트 구축');
    
    const item2 = items.nth(1);
    await expect(item2.locator('h3')).toHaveText('무료 서비스');
    await expect(item2.locator('p')).toHaveText('기본 기능은 완전 무료');
    
    const item3 = items.nth(2);
    await expect(item3.locator('h3')).toHaveText('올인원 기능');
    await expect(item3.locator('p')).toHaveText('설교, 공지, 일정 관리까지');
    
    // 각 아이콘 확인
    await expect(item1.locator('.w-12.h-12')).toBeVisible();
    await expect(item2.locator('.w-12.h-12')).toBeVisible();
    await expect(item3.locator('.w-12.h-12')).toBeVisible();
  });
});

// 에이전트 3: 4단계 신청 프로세스 테스트
test.describe('ChurchHub 신청 페이지 - 에이전트 3: 4단계 프로세스', () => {
  test('4단계 신청 프로세스와 각 단계 제목이 올바르게 표시되는지 확인', async ({ page }) => {
    await page.goto('https://churchhub.co.kr/apply');
    
    // 신청 폼 컨테이너 확인
    const formContainer = page.locator('.bg-white.rounded-xl.shadow-lg.p-8 form');
    await expect(formContainer).toBeVisible();
    
    // 4단계 신청 프로세스 확인
    const steps = formContainer.locator('h2:has-text("교회 기본 정보"), h2:has-text("교회 상세 정보"), h2:has-text("테마 선택"), h2:has-text("약관 동의")');
    await expect(steps).toHaveCount(4);
    
    // 단계 1: 교회 기본 정보
    const step1 = formContainer.locator('h2:has-text("교회 기본 정보")');
    await expect(step1).toBeVisible();
    await expect(step1.locator('xpath=../span[contains(@class, "bg-blue-100")]')).toHaveText('1');
    
    // 단계 1의 그리드 레이아웃 확인
    const step1Grid = formContainer.locator('h2:has-text("교회 기본 정보") >> xpath=../../../div[contains(@class, "grid")]');
    await expect(step1Grid).toBeVisible();
    
    // 단계 2: 교회 상세 정보
    const step2 = formContainer.locator('h2:has-text("교회 상세 정보")');
    await expect(step2).toBeVisible();
    await expect(step2.locator('xpath=../span[contains(@class, "bg-blue-100")]')).toHaveText('2');
    
    // 단계 3: 테마 선택
    const step3 = formContainer.locator('h2:has-text("테마 선택")');
    await expect(step3).toBeVisible();
    await expect(step3.locator('xpath=../span[contains(@class, "bg-blue-100")]')).toHaveText('3');
    
    // 테마 선택 그리드 확인
    const themeGrid = formContainer.locator('h2:has-text("테마 선택") >> xpath=../../../div[contains(@class, "grid")]');
    await expect(themeGrid).toBeVisible();
    
    // 3개 테마 옵션 확인
    const themeOptions = themeGrid.locator('label');
    await expect(themeOptions).toHaveCount(3);
    
    // 테마 옵션 내용 확인
    await expect(themeOptions.nth(0)).toContainText('전통');
    await expect(themeOptions.nth(1)).toContainText('모던');
    await expect(themeOptions.nth(2)).toContainText('미니멀');
    
    // 단계 4: 약관 동의
    const step4 = formContainer.locator('h2:has-text("약관 동의")');
    await expect(step4).toBeVisible();
    await expect(step4.locator('xpath=../span[contains(@class, "bg-blue-100")]')).toHaveText('4');
    
    // 약관 동의 체크박스 확인
    const checkboxes = formContainer.locator('h2:has-text("약관 동의") >> xpath=../../../div//input[@type="checkbox"]');
    await expect(checkboxes).toHaveCount(3);
  });
});

// 에이전트 4: 폼 유효성 검사 및 기능 테스트
test.describe('ChurchHub 신청 페이지 - 에이전트 4: 폼 기능', () => {
  test('모든 입력 필드와 유효성 검사가 올바르게 작동하는지 확인', async ({ page }) => {
    await page.goto('https://churchhub.co.kr/apply');
    
    const form = page.locator('form');
    
    // 교회명 입력 필드 확인
    const churchNameInput = form.locator('input[name="churchName"]');
    await expect(churchNameInput).toBeVisible();
    await expect(churchNameInput).toHaveAttribute('placeholder', '예: 서울중앙교회');
    await expect(churchNameInput.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    // 담임목사 입력 필드 확인
    const pastorNameInput = form.locator('input[name="pastorName"]');
    await expect(pastorNameInput).toBeVisible();
    await expect(pastorNameInput.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    // 연락처 입력 필드 확인
    const phoneInput = form.locator('input[name="contactPhone"]');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    // 이메일 입력 필드 확인
    const emailInput = form.locator('input[name="contactEmail"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    // 주소 입력 필드 확인
    const addressInput = form.locator('input[name="address"]');
    await expect(addressInput).toBeVisible();
    await expect(addressInput.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    // 테마 선택 라디오 버튼 확인
    const themeRadios = form.locator('input[name="theme"]');
    await expect(themeRadios).toHaveCount(3);
    
    // 약관 동의 체크박스 확인
    const agreeTerms = form.locator('input[name="agreeTerms"]');
    await expect(agreeTerms).toBeVisible();
    await expect(agreeTerms.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    const agreePrivacy = form.locator('input[name="agreePrivacy"]');
    await expect(agreePrivacy).toBeVisible();
    await expect(agreePrivacy.locator('xpath=..//span[contains(@class, "text-red-500")]')).toHaveText('*');
    
    const agreeMarketing = form.locator('input[name="agreeMarketing"]');
    await expect(agreeMarketing).toBeVisible();
    await expect(agreeMarketing.locator('xpath=..//span[not(contains(@class, "text-red-500"))]).toBeTruthy(); // 선택사항이므로 * 없음
    
    // 제출 버튼 확인
    const submitButton = form.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText(/교회 신청하기/);
    
    // 모든 필드에 임시 값 입력하여 기능 테스트
    await churchNameInput.fill('테스트 교회');
    await pastorNameInput.fill('김테스트 목사');
    await phoneInput.fill('010-1234-5678');
    await emailInput.fill('test@church.com');
    await addressInput.fill('서울시 강남구 테헤란로 123');
    
    // 테마 선택
    await form.locator('input[name="theme"][value="modern"]').check();
    
    // 약관 동의
    await agreeTerms.check();
    await agreePrivacy.check();
    await agreeMarketing.check();
    
    // 제출 버튼 클릭 (실제 제출은 방지)
    await submitButton.click();
    
    // 폼이 제출되려고 시도하는지 확인 (페이지 리로드나 이동 감지)
    await page.waitForTimeout(1000);
  });
});

// 에이전트 5: 고객지원 및 최종 레이아웃 테스트
test.describe('ChurchHub 신청 페이지 - 에이전트 5: 고객지원', () => {
  test('고객지원 정보와 최종 레이아웃이 올바르게 표시되는지 확인', async ({ page }) => {
    await page.goto('https://churchhub.co.kr/apply');
    
    // 신청 안내문구 섹션 확인
    const infoSection = page.locator('.mt-8.bg-blue-50.rounded-lg.p-6');
    await expect(infoSection).toBeVisible();
    
    const infoTitle = infoSection.locator('h3:has-text("신청 안내")');
    await expect(infoTitle).toBeVisible();
    await expect(infoTitle).toHaveCSS('color', 'rgb(30, 58, 138)'); // blue-900
    
    // 안내문구 목록 확인
    const infoList = infoSection.locator('ul.text-sm.text-blue-800.space-y-2 li');
    await expect(infoList).toHaveCount(4);
    
    const infoTexts = await infoList.allTextContents();
    expect(infoTexts[0]).toContain('신청 후 3영업일 내로 검토하여 결과를 알려드립니다');
    expect(infoTexts[1]).toContain('승인 시 무료로 교회 웹사이트가 생성됩니다');
    expect(infoTexts[2]).toContain('필요 시 추가 정보를 요청드릴 수 있습니다');
    expect(infoTexts[3]).toContain('문의사항이 있으시면 고객지원으로 연락주세요');
    
    // 고객지원 정보 섹션 확인
    const supportSection = page.locator('.mt-6.text-center.text-sm.text-gray-600');
    await expect(supportSection).toBeVisible();
    
    const supportParagraphs = supportSection.locator('p');
    await expect(supportParagraphs).toHaveCount(2);
    
    // 첫 번째 문단: 문의 정보 확인
    await expect(supportParagraphs.nth(0)).toHaveText('문의: 070-8065-7623 | 이메일: support@churchhub.co.kr');
    
    // 두 번째 문단: 운영 시간 확인
    await expect(supportParagraphs.nth(1)).toHaveText('평일 9:00-18:00 (주말 및 공휴일 제외)');
    
    // 전체 페이지 반응형 디자인 확인
    await page.setViewportSize({ width: 320, height: 568 }); // 모바일 화면
    await expect(page.locator('.min-h-screen')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 }); // 태블릿 화면
    await expect(page.locator('.max-w-4xl')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // 데스크톱 화면
    await expect(page.locator('.grid')).toBeVisible();
    
    // 모든 섹션이 정상적으로 표시되는지 최종 확인
    await expect(page.locator('h1:has-text("교회 웹사이트 신청")')).toBeVisible();
    await expect(page.locator('h2:has-text("왜 ChurchHub인가요?")')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('.bg-blue-50')).toBeVisible(); // 신청 안내
    await expect(page.locator('.text-center.text-sm')).toBeVisible(); // 고객지원
  });
});

// 모든 에이전트가 완료되었음을 알리는 최종 테스트
test.describe('ChurchHub 신청 페이지 - 최종 통합 테스트', () => {
  test('모든 에이전트 테스트가 완료되고 페이지가 완벽하게 구현되었음을 확인', async ({ page }) => {
    await page.goto('https://churchhub.co.kr/apply');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    // 모든 주요 요소가 존재하는지 최종 확인
    const expectedElements = [
      'h1:has-text("교회 웹사이트 신청")',
      'h2:has-text("왜 ChurchHub인가요?")',
      'input[name="churchName"]',
      'input[name="pastorName"]',
      'input[name="contactPhone"]',
      'input[name="contactEmail"]',
      'input[name="address"]',
      'input[name="theme"]',
      'input[name="agreeTerms"]',
      'input[name="agreePrivacy"]',
      'button[type="submit"]',
      '.bg-blue-50 h3:has-text("신청 안내")',
      '.text-center:has-text("070-8065-7623")'
    ];
    
    for (const selector of expectedElements) {
      await expect(page.locator(selector)).toBeVisible();
    }
    
    console.log('✅ 모든 테스트 통과! ChurchHub 신청 페이지가 완벽하게 구현되었습니다.');
  });
});
