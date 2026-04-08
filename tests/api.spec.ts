import { test, expect } from '@playwright/test';

test.describe('API 테스트', () => {
  test('GET /api/churches - 교회 목록 조회', async ({ request }) => {
    const response = await request.get('/api/churches');
    
    expect(response.ok()).toBeTruthy();
    
    const churches = await response.json();
    
    // 배열인지 확인
    expect(Array.isArray(churches)).toBeTruthy();
    
    // 교회가 하나 이상 있는 경우 필드 확인
    if (churches.length > 0) {
      const church = churches[0];
      expect(church).toHaveProperty('id');
      expect(church).toHaveProperty('slug');
      expect(church).toHaveProperty('name');
    }
  });

  test('GET /api/churches/[slug] - 특정 교회 조회 (존재하는 경우)', async ({ request }) => {
    // 먼저 교회 목록을 가져와서 존재하는 slug 확인
    const listResponse = await request.get('/api/churches');
    const churches = await listResponse.json();
    
    if (churches.length > 0) {
      const slug = churches[0].slug;
      const response = await request.get('/api/churches/' + slug);
      
      expect(response.ok()).toBeTruthy();
      
      const church = await response.json();
      expect(church).toHaveProperty('id');
      expect(church).toHaveProperty('name');
      expect(church).toHaveProperty('slug');
    } else {
      // 교회가 없는 경우 404 또는 빈 응답
      const response = await request.get('/api/churches/test-church');
      expect(response.status()).toBe(404);
    }
  });

  test('GET /api/churches/[slug] - 존재하지 않는 교회 조회', async ({ request }) => {
    const response = await request.get('/api/churches/non-existent-church-12345');
    
    // 404 또는 에러 응답이어야 함
    expect([404, 400, 500]).toContain(response.status());
  });
});
