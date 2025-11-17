const prisma = require('../prismaClient');

// post time table
const registSchedule = async (table, userId) => {
    const dataToCreate = table.map((block) => ({
        // 사용자 id
        userId: userId,
        // 요일
        dayOfWeek: block.dayOfWeek,
        // block 종류
        type: block.type,
        // 시작 시간
        startTime: block.startTime,
        // 종료 시간
        endTime: block.endTime,
    }));

    // 트랜젝션으로 삭제, 생성 실행
    const newSchedule = await prisma.$transaction(async (tx) => {
        // 기존 time table 전체 삭제
        await tx.scheduleBlock.deleteMany({
            where: { userId: userId },
        });

        // 새 데이터 저장
        await tx.scheduleBlock.createMany({
            data: dataToCreate,
        });

        // 일주일치 시간표 반환
        return tx.scheduleBlock.findMany({
            where: { userId: userId },
            // 요일, 시간 순 정렬
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
    });

    return newSchedule;
}


// get time table
const getSchedule = async (userId) => {
    return prisma.scheduleBlock.findMany({
        where: { userId: userId },
        // 요일, 시간 순 정렬
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
        ]
    });
};


module.exports = {
    registSchedule,
    getSchedule,
};