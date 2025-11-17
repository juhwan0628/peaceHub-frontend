const prisma = require('../prismaClient');
const { nanoid } = require('nanoid'); // 방 고유 코드 생성을 위한 nanoid

// 에러 발생 표시를 위한 클래스
// 코드가 없을 경우: 404 반환
// 방에 이미 속해 있을 경우: 409 반환
class RoomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// 방 생성 함수
// 4개의 트랜잭션이 하나라도 실패할 경우 실패 반환
const createRoom = async (name, ownerId) => {
    // 방 생성 시 다른 방에 참여하고 있는지 확인
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (owner.roomId) {
        // User 테이블에 roomId가 null이 아닐 경우 409 에러 반환
        throw new RoomError('already in another room', 409);
    }

    // nanoid로 6자리 코드 생성
    const inviteCode = nanoid(6);

    // roomTaskTemplate에 있는 내용 복사
    // findMany(): 모든 레코드 반환
    const allTaskTemplates = await prisma.roomTaskTemplate.findMany();

    // 트랜잭션 실행
    // 단일 방 참여 검사, nanoid 코드 생성, roomTaskTemplate 복사, 방장 추가 업무가 모두 완료되어야 방 객체 반환
    const newRoom = await prisma.$transaction(async (tx) => {
        // 1) 방 생성 tx : 트랜잭션용 prisma client
        const room = await tx.room.create({
            data: {
                name: name,
                inviteCode: inviteCode,
                ownerId: ownerId,
            },
        });

        // 2) RoomTaskTemplate에서 복사할 데이터 준비
        const tasksCopy = allTaskTemplates.map((template) => ({
            title: template.title,
            difficulty: template.difficulty,
            estimatedTime: template.estimatedTime,

            // 생성된 room 고유 id를 연결
            roomId: room.id,
        }));

        // 3) 준비된 데이터 발사, DB에 복사하여 생성
        if (tasksCopy.length > 0) {
            await tx.roomTask.createMany({
                data: tasksCopy,
            });
        }

        // 4) 방장을 첫 번째 참여자로 등록 User 테이블의 roomId를 업데이트
        await tx.user.update({
            where: { id: ownerId },
            data: { roomId: room.id },
        });

        // 트랜잭션이 성공하면 생성된 room 객체 반환
        return room;
    });

    return newRoom;
};



// 방 참여 함수
const joinRoom = async (inviteCode, userId) => {
    // 초대 코드 유효성 검사
    const room = await prisma.room.findUnique({
        where: { inviteCode: inviteCode },
    });

    if (!room) {
        // 코드가 존재하지 않으면 404 not found 반환
        throw new RoomError('invalid code', 404);
    }
    // 방 생성 시 다른 방에 참여하고 있는지 확인
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.roomId) {
        // 사용자가 이미 roomId를 가지고 있으면 409 conflict 반환
        throw new RoomError('already in another room', 409);
    }

    // 방 참여 시 User의 roomId 필드를 참여한 room의 id로 업데이트
    await prisma.user.update({
        where: { id: userId },
        data: { roomId: room.id },
    });

    // 방 참여 성공 시 방 정보 반환
    return room;
};

module.exports = {
    // 방 생성 함수
    createRoom,

    // 방 참여 함수
    joinRoom,

    // error 식별 클래스
    RoomError,
};