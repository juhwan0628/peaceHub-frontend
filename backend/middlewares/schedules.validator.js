/** 새로 등록하는 타임 테이블에 대한 유효성, 무결성 검사
 * 시간표를 설정할 때마다 검증 후 컨트롤러로 연결
*/

/**
 * request로 오는 time block 객체
 * const blocks = [
        { dayOfWeek: 'MONDAY', type: 'QUIET', startTime: 0, endTime: 540 },
        { dayOfWeek: 'MONDAY', type: 'TASK', startTime: 540, endTime: 720 },
        { dayOfWeek: 'TUESDAY', type: 'QUIET', startTime: 0, endTime: 540 },
        { dayOfWeek: 'TUESDAY', type: 'BUSY', startTime: 720, endTime: 780 },
        { dayOfWeek: 'MONDAY', type: 'BUSY', startTime: 720, endTime: 780 }
    ];
 * 
    겹치는 시간을 검사하기 위한 객체 생성 같은 key 끼리 정리 후 정렬-> 인접한 종료 시간과 시작 시간만 검사
 * const dayOfWeekBlock = {
        "MONDAY": [
            { "dayOfWeek": "MONDAY", "type": "QUIET", "startTime": 0, "endTime": 540 },
            { "dayOfWeek": "MONDAY", "type": "TASK", "startTime": 540, "endTime": 720 },
            { "dayOfWeek": "MONDAY", "type": "BUSY", "startTime": 720, "endTime": 780 }
        ],
        "TUESDAY": [
            { "dayOfWeek": "TUESDAY", "type": "QUIET", "startTime": 0, "endTime": 540 },
            { "dayOfWeek": "TUESDAY", "type": "BUSY", "startTime": 720, "endTime": 780 }
        ]
    }
 */

const validateBlock = (req, res, next) => {
    // 시간표 내용이 담긴 body 추출 
    const table = req.body;

    // time block의 배열의 형태인지 확인. 배열이 아닐 경우 400 bad request 반환
    if (!Array.isArray(table)) {
        return res.status(400).json({ message: 'body is not array' });
    }

    // 요일, time block type이 유효한지 확인
    const validTypes = ['QUIET', 'BUSY', 'TASK'];
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // table의 모든 block을 순회하며 확인
    for (const block of table) {
        if (
            // 요일
            !validDays.includes(block.dayOfWeek) ||
            // 타입
            !validTypes.includes(block.type) ||
            // 시작 시간의 type이 정수형인지
            typeof block.startTime !== 'number' ||
            // 종료 시간  type이 정수형인지
            typeof block.endTime !== 'number' ||
            // 시작, 종료 시간이 역전되어있지 않은지
            block.startTime >= block.endTime
        ) {
            // 하나라도 조건 충족이 되지 않는다면 400 bad request, 해당 block 반환
            return res.status(400).json({
                message: 'include invalid block',
                invalidBlock: block
            });
        }
    }

    // 모든 time block의 내용이 유효하다면 겹치는 시간이 없는지 검사

    // 요일별로 time block 정리를 위한 객체 생성 해당 객체에는 key:value 형태로 데이터 삽입
    const dayOfWeekBlock = {};

    for (const block of table) {
        // time block의 dayOfWeek을 key 값으로 하여 해당 key가 존재하지 않으면 key 생성
        if (!dayOfWeekBlock[block.dayOfWeek]) {
            dayOfWeekBlock[block.dayOfWeek] = [];
        }
        // 해당 key의 value로 time block 객체 삽입
        dayOfWeekBlock[block.dayOfWeek].push(block);
    }

    // key 내부 time block들을 정렬
    for (const day in dayOfWeekBlock) {

        // 특정 요일의 모든 value를 저장
        const dailyBlocks = dayOfWeekBlock[day];
        // JS 자체 정렬 함수를 활용하여 시작 시간을 기준으로 정렬 O(NlogN)
        dailyBlocks.sort((a, b) => a.startTime - b.startTime);

        for (let i = 1; i < dailyBlocks.length; i++) {
            // 정렬 이후 앞선 time block의 종료 시간이 이후 time block의 시작 시간보다 클 경우(겹칠 경우)
            if (dailyBlocks[i - 1].endTime > dailyBlocks[i].startTime) {
                // 409 conflict와 함께 겹친 두 time block을 반환 
                return res.status(409).json({
                    message: 'time conflict',
                    preBlock: dailyBlocks[i - 1],
                    lateBlock: dailyBlocks[i]
                });
            }
        }
        
        // 배열 내 빈틈 검사 빈틈 존재 시 400 bad request 반환

        // 00분 공백 검사
        if (dailyBlocks[0].startTime !== 0) {
            return res.status(400).json({ message: `${day} 00분 공백` });
        }

        // 1440분 공백 검사
        if (dailyBlocks[dailyBlocks.length - 1].endTime !== 1440) {
            return res.status(400).json({ message: `${day} 1440분 공백` });
        }

        // 빈 틈 검사
        for (let i = 1; i < dailyBlocks.length; i++) {
            // 종료시간 == 시작시간 검사
            if (dailyBlocks[i - 1].endTime !== dailyBlocks[i].startTime) {
                // 공백 발견 시 400 bad request와 공백 시간 반환
                return res.status(400).json({
                     message: `${day} ${dailyBlocks[i - 1].endTime}분 ~ ${dailyBlocks[i].startTime}분 공백`,
                     preBlock: dailyBlocks[i - 1],
                     lateBlock: dailyBlocks[i]
                    });
            }
        }
    }

    // 스케쥴 유효성, 무결성 검사 통과 시 controller로 넘어감
    next();
}

module.exports = {
    validateBlock,
}