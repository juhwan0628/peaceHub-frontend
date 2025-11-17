const request = require('supertest');
const app = require('../app'); // Express 앱 (app.js)
const prisma = require('../prismaClient'); // Prisma Client
// 모킹할 checkAuth 미들웨어
const { isLoggedIn } = require('../middlewares/checkAuth.middleware');

/**
 * 1. 인증 미들웨어 모킹
 * app.js에서 사용하는 checkAuth(isLoggedIn)를 모킹합니다.
 */
jest.mock('../middlewares/checkAuth.middleware', () => ({
  // app.js는 checkAuth라는 이름으로 import하지만, 원본 모듈은 isLoggedIn을 export합니다.
  isLoggedIn: jest.fn((req, res, next) => next()),
}));

// --- 테스트 스위트 ---
describe('Schedule API (/api/schedules)', () => {
  let testUser; // 테스트용 사용자

  // --- 2. 테스트 전/후 설정 ---
  beforeAll(async () => {
    // 2-1. 테스트용 유저 1명 생성
    testUser = await prisma.user.create({
      data: {
        googleId: 'scheduleTestUser_googleId',
        email: 'scheduleTest@email.com',
        name: '스케줄테스터',
      },
    });
  });

  afterAll(async () => {
    // 2-2. 생성한 유저 및 관련 데이터 삭제
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    // (onDelete: Cascade로 ScheduleBlock도 자동 삭제됨)
  });

  // [중요] 각 테스트(it) 실행 전에 ScheduleBlock을 초기화
  beforeEach(async () => {
    await prisma.scheduleBlock.deleteMany({
      where: { userId: testUser.id },
    });
  });

  // --- 3. GET /api/schedules 테스트 ---
  describe('GET /api/schedules (스케줄 조회)', () => {
    it('스케줄이 없는 경우 200 상태와 빈 배열을 반환해야 합니다', async () => {
      // (1) testUser로 로그인한 척
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
      });

      // (2) API 호출
      const res = await request(app).get('/api/schedules');

      // (3) 응답 검증
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]); // 빈 배열
    });

    it('스케줄이 있는 경우 200 상태와 정렬된 배열을 반환해야 합니다', async () => {
      // (1) 테스트용 데이터 미리 삽입
      await prisma.scheduleBlock.create({
        data: {
          userId: testUser.id,
          dayOfWeek: 'MONDAY',
          type: 'TASK',
          startTime: 600,
          endTime: 720,
        },
      });

      // (2) testUser로 로그인한 척
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
      });

      // (3) API 호출
      const res = await request(app).get('/api/schedules');

      // (4) 응답 검증
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].type).toBe('TASK');
    });
  });

  // --- 4. POST /api/schedules 테스트 ---
  describe('POST /api/schedules (스케줄 등록/덮어쓰기)', () => {
    // (1) testUser로 로그인한 척 (POST 테스트 내내 고정)
    beforeEach(() => {
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
      });
    });

    it('유효한 스케줄(공백/겹침 없음)을 보내면 201과 새 스케줄을 반환해야 합니다', async () => {
      const validSchedule = [
        // 월요일 00:00 ~ 24:00
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 600 },
        { dayOfWeek: 'MONDAY', type: 'TASK', startTime: 600, endTime: 1440 },
        // 화요일 00:00 ~ 24:00
        { dayOfWeek: 'TUESDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        // (수~일요일 00:00 ~ 24:00 ... TASK로 채워야 함)
      ];
      // (테스트 편의상 MONDAY, TUESDAY만 보냄)
      // [수정] Validator가 7일치 24시간을 모두 검사하므로, 7일치를 모두 채워야 함
      const fullValidSchedule = [
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 600 },
        { dayOfWeek: 'MONDAY', type: 'TASK', startTime: 600, endTime: 1440 },
        { dayOfWeek: 'TUESDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        { dayOfWeek: 'WEDNESDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        { dayOfWeek: 'THURSDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        { dayOfWeek: 'FRIDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        { dayOfWeek: 'SATURDAY', type: 'TASK', startTime: 0, endTime: 1440 },
        { dayOfWeek: 'SUNDAY', type: 'TASK', startTime: 0, endTime: 1440 },
      ];


      const res = await request(app)
        .post('/api/schedules')
        .send(fullValidSchedule);

      // 응답 검증
      expect(res.status).toBe(201);
      expect(res.body.length).toBe(8); // (블록 8개)
      expect(res.body[0].type).toBe('QUIET');

      // DB 검증
      const dbCount = await prisma.scheduleBlock.count({ where: { userId: testUser.id } });
      expect(dbCount).toBe(8);
    });

    it('시간이 겹치는 배열을 보내면 409 에러를 반환해야 합니다', async () => {
      const overlappingSchedule = [
        // (월요일만 보냄 -> 빈틈 검사에서 400이 먼저 뜰 것임)
        // (테스트를 위해 빈틈 검사보다 겹침 검사를 먼저 통과하도록 수정)
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 600 },
        { dayOfWeek: 'MONDAY', type: 'TASK', startTime: 540, endTime: 1440 }, // 540~600 겹침
      ];

      const res = await request(app)
        .post('/api/schedules')
        .send(overlappingSchedule);

      // 409 Conflict (Validator가 겹침을 감지)
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('time conflict');
    });

    it('시간에 빈틈이 있는 배열을 보내면 400 에러를 반환해야 합니다 (중간 빈틈)', async () => {
      const gappedSchedule = [
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 600 },
        // 600 ~ 700 사이가 빔
        { dayOfWeek: 'MONDAY', type: 'TASK', startTime: 700, endTime: 1440 },
      ];

      const res = await request(app)
        .post('/api/schedules')
        .send(gappedSchedule);

      // 400 Bad Request (Validator가 빈틈을 감지)
      expect(res.status).toBe(400);
      expect(res.body.message).toContain(`${res.body.preBlock.dayOfWeek} ${res.body.preBlock.endTime}분 ~ ${res.body.lateBlock.startTime}분 공백`); // Validator의 에러 메시지
    });

    it('00:00시에 시작하지 않으면 400 에러를 반환해야 합니다', async () => {
      const gapAtStartSchedule = [
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 10, endTime: 1440 }, // 0분 시작이 아님
      ];

      const res = await request(app)
        .post('/api/schedules')
        .send(gapAtStartSchedule);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('00분 공백');
    });

    it('24:00시에 끝나지 않으면 400 에러를 반환해야 합니다', async () => {
      const gapAtEndSchedule = [
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 1439 }, // 1440분 끝이 아님
      ];

      const res = await request(app)
        .post('/api/schedules')
        .send(gapAtEndSchedule);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('1440분 공백');
    });
  });
});