/**
 * 테스트 전용 코드이므로 코드 리뷰 하실 필요는 없습니다.
 * room 로직 관련 테스트 파일입니다. npm test를 입력하여 실행합니다.
 * api 관련 테스트는 gpt한테 api 상세 명세를 입력하면 알아서 테스트용 코드 짜줍니다.
 * 이 테스트 형식을 바탕으로 진행하는게 제일 편할 듯 합니다. 테스트 도중 이슈 생기면 말씀해주세요.
 * */ 


const request = require('supertest');
const app = require('../app'); // Express 앱 (app.js)
const prisma = require('../prismaClient'); // Prisma Client (prismaClient.js)
const { isLoggedIn } = require('../middlewares/checkAuth.middleware');

/**
 * 1. 인증 미들웨어 모킹(Mocking)
 * 테스트 코드에서 실제 구글 로그인을 할 수 없으므로,
 * checkAuth(isLoggedIn) 미들웨어가 "로그인 한 척" 하도록 만듭니다.
 *
 * jest.mock이 checkAuth.middleware 파일을 가로채서,
 * 실제 로직 대신 우리가 정의하는 가짜 함수를 실행하도록 만듭니다.
 */
jest.mock('../middlewares/checkAuth.middleware', () => ({
  isLoggedIn: jest.fn((req, res, next) => next()), // 기본적으로는 next()를 호출
}));

// --- 테스트 스위트 ---
describe('Room API (/api/rooms)', () => {
  let userA; // 방장
  let userB; // 참여자
  let testRoomTemplate; // 테스트용 업무 템플릿

  // --- 2. 테스트 전 설정 (beforeAll) ---
  // 모든 테스트가 실행되기 전에 딱 한 번 DB를 세팅합니다.
  beforeAll(async () => {
    // 2-1. 테스트용 유저 2명 생성
    userA = await prisma.user.create({
      data: {
        googleId: 'testUserA_googleId',
        email: 'testA@email.com',
        name: '방장A',
      },
    });

    userB = await prisma.user.create({
      data: {
        googleId: 'testUserB_googleId',
        email: 'testB@email.com',
        name: '참여자B',
      },
    });

    // 2-2. 테스트용 RoomTaskTemplate 1개 생성 (방 생성 시 복사될 원본)
    // (이전 대화에서 schema.prisma의 문법 오류를 수정했다고 가정합니다)
    testRoomTemplate = await prisma.roomTaskTemplate.create({
      data: {
        title: '테스트 업무',
        difficulty: 3,
        estimatedTime: 60,
      },
    });
  });

  // --- 3. 테스트 후 정리 (afterAll) ---
  // 모든 테스트가 끝난 후 DB를 정리합니다.
  afterAll(async () => {
    // 테스트로 생성된 모든 데이터를 정리합니다.
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
    await prisma.roomTaskTemplate.deleteMany({
      where: { id: testRoomTemplate.id },
    });
    // Room 삭제 시 onDelete: Cascade로 RoomTask 등도 삭제됨
    await prisma.room.deleteMany({
      where: { ownerId: userA.id },
    });
  });

  // --- 4. 테스트 케이스 ---

  let inviteCodeForJoinTest; // 방 참여 테스트를 위해 초대 코드를 저장할 변수

  /**
   * [A] 방 생성 (POST /api/rooms)
   */
  describe('POST /api/rooms', () => {
    it('방장이 새 방을 생성하면 201 상태와 방 정보를 반환해야 합니다', async () => {
      // (1) "방장A"로 로그인한 척 하도록 모킹 설정
      //    (isLoggedIn 함수가 실행될 때, req.user에 userA 정보를 주입)
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = userA; 
        next();
      });

      // (2) API 호출
      const res = await request(app)
        .post('/api/rooms') // app.js에서 /api/rooms로 설정했다고 가정
        .send({ name: '테스트 방' });

      // (3) 응답 검증
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('테스트 방');
      expect(res.body.ownerId).toBe(userA.id);
      expect(res.body.inviteCode).toBeDefined();

      // (4) DB 검증 1: 방장이 방에 참여했는지? (User.roomId 업데이트)
      const updatedOwner = await prisma.user.findUnique({ where: { id: userA.id } });
      expect(updatedOwner.roomId).toBe(res.body.id);

      // (5) DB 검증 2: RoomTask가 복사되었는지?
      const copiedTasks = await prisma.roomTask.count({
        where: { roomId: res.body.id },
      });
      expect(copiedTasks).toBe(1); // 템플릿 1개를 복사했으므로
      
      inviteCodeForJoinTest = res.body.inviteCode; // [저장] 다음 테스트를 위해 초대 코드 저장
    });

    it('이미 방에 속한 유저가 방 생성을 시도하면 409 에러를 반환해야 합니다', async () => {
      // (1) "방장A" (이미 방이 있음)로 로그인한 척
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = userA;
        next();
      });

      // (2) API 호출
      const res = await request(app)
        .post('/api/rooms')
        .send({ name: '두 번째 방' });

      // (3) 응답 검증 (409 Conflict)
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('already in another room');
    });
  });

  /**
   * [B] 방 참여 (POST /api/rooms/join)
   */
  describe('POST /api/rooms/join', () => {
    it('새로운 유저가 유효한 초대 코드로 참여하면 200 상태를 반환해야 합니다', async () => {
      // (1) "참여자B" (방이 없음)로 로그인한 척
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = userB;
        next();
      });

      // (2) API 호출
      const res = await request(app)
        .post('/api/rooms/join')
        .send({ inviteCode: inviteCodeForJoinTest }); // [사용] 방 생성 테스트에서 받은 코드

      // (3) 응답 검증
      expect(res.status).toBe(200);
      expect(res.body.inviteCode).toBe(inviteCodeForJoinTest);

      // (4) DB 검증: "참여자B"의 roomId가 업데이트되었는지?
      const updatedJoiner = await prisma.user.findUnique({ where: { id: userB.id } });
      expect(updatedJoiner.roomId).toBe(res.body.id);
    });

    it('이미 방에 참여한 유저가 다시 참여 시도 시 409 에러를 반환해야 합니다', async () => {
      // (1) "참여자B" (이제 방이 있음)로 로그인한 척
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = userB;
        next();
      });

      // (2) API 호출
      const res = await request(app)
        .post('/api/rooms/join')
        .send({ inviteCode: inviteCodeForJoinTest });

      // (3) 응답 검증
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('already in another room');
    });

     it('유효하지 않은 초대 코드로 참여 시도 시 404 에러를 반환해야 합니다', async () => {
      // (1) "참여자B" (아직은 방이 있다고 가정)로 로그인
      isLoggedIn.mockImplementation((req, res, next) => {
        req.user = userB;
        next();
      });

      // (2) API 호출
      const res = await request(app)
        .post('/api/rooms/join')
        .send({ inviteCode: 'INVALID_CODE_123' }); // 잘못된 코드

      // (3) 응답 검증
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('invalid code');
    });
  });
});