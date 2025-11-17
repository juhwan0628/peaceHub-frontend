const express = require('express'); // require express framework
const router = express.Router(); // generate router object

/** 세션으로 사용자 확인
 * GET /api/user/me
 * 프론트엔드에서 새로고침, 새 탭 접속할 때마다 유저 객체 소실 그 때마다 해당 api 요청 필요
 * 프론트는 세션에 접근 불가. 세션에 있는 id를 서버에 보내 유저 객체를 반환
*/
router.get('/', (req, res) => {
    res.status(200).json({
    message: 'get me successful',
    user: req.user,
  });
});

module.exports = router;