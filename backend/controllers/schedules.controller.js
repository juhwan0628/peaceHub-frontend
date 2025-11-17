const scheduleService = require('../services/schedules.service'); // require schedule service

// time table 등록
const registSchedule = async (req, res, next) => {

    try {
        // 유효성, 무결성 검사가 끝난 time table
        const table = req.body;
        // 사용자 id 추출
        const userId = req.user.id;
        
        // service 호출
        // await 후 서비스에서 생성한 time table 객체 배열 반환
        const newSchedule = await scheduleService.registSchedule(table, userId);
        
        // 201 create와 함깨 time table 객체 배열 반환
        res.status(201).json(newSchedule);
    } catch (error) {
        next(error);
    }

}

// 사용자 time table 요청
const getSchedule = async(req, res, next) => {
    try {
        // userId 추출
        const userId = req.user.id;
        // service 호출
        const schedule = await scheduleService.getSchedule(userId);
        
        // 200 Ok와 함깨 time table 객체 배열 반환
        res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    // time table 등록 함수
    registSchedule,
    // time table 조회 함수
    getSchedule,
};