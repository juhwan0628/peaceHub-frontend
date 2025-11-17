const { Prisma } = require('@prisma/client');
const roomService = require('../services/rooms.service'); // require room service


// 방 참여 컨트롤러
const createRoom = async (req, res, next) => {

    try {
        // 방 이름, 방장 id 추출
        const { name } = req.body;
        const ownerId = req.user.id;

        // 유효성 검사
        // 방 이름이 없을 경우 400 bad request 반환
        if (!name) {
            return res.status(400).json({ message: 'need room name' });
        }

        // service 호출
        // await 후 서비스에서 생성한 방 객체 반환
        const newRoom = await roomService.createRoom(name, ownerId);

        // 생성된 방 객체를 201 코드와 함께 반환
        res.status(201).json(newRoom);

    } catch (error) {
        // 에러 발생 시
        if (error instanceof roomService.RoomError) {
            // 방장이 이미 방에 속해있을 경우 409 에러 반환
            return res.status(error.status).json({ message: error.message });
        }
        else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // 초대 코드가 db 내에서 중복될 경우 prisma에서 @unique로 자동 확인
            return res.status(409).json({ message: 'invite code conflict' });
        }
        // 그 외 500 에러 반환
        next(error);
    }
};



// 방 생성 컨트롤러
const joinRoom = async (req, res, next) => {
    try {
        // inviteCode, userid 추출
        const { inviteCode } = req.body;
        const userId = req.user.id;

        //  유효성 검사
        // 방 코드로 검사 코드가 없을 경우 400 bad request 반환
        if (!inviteCode) {
            return res.status(400).json({ message: 'need invite code' });
        }

        // service 호출
        // await 후 참여한 방 객체 반환
        const joinedRoom = await roomService.joinRoom(inviteCode, userId);

        // 방 정보 객체를 200 코드와 함께 반환
        res.status(200).json(joinedRoom);

    } catch (error) {
        // 에러 처리
        if (error instanceof roomService.RoomError) {
            // 방 참여자가 이미 다른 방에 참여 시 409 conflict 반환
            // 코드가 유효하지 않을 경우 404 not found 반환
            return res.status(error.status).json({ message: error.message });
        }
        // 그 외 500 에러 반환
        next(error);
    }
};

module.exports = {
    // 방 생성 컨트롤러
    createRoom,

    // 방 참여 컨트롤러
    joinRoom,
};