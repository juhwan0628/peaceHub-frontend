const express = require('express'); // require express framework
const passport = require('passport'); // require passport middleware
const authController = require('../controllers/auth.controller'); // require auth controller
const router = express.Router(); // generate router object

/** google sign up
 * GET /api/auth/google 
 * passport.authenticate('google' 해당 파트에서 내부적 처리로 googleStrategy 실행(config/passport/google.strategy.js))
*/
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//router.get('/kakaotalk', passport.authenticate('kakaotalk' 과 같은 형태로 로그인 확장 가능

/**  GET /api/auth/google/callback
 * 로그인 성공 후 지정받은 callback URL로 리디렉션
*/
router.get(
  '/google/callback',
  // 로그인 실패 시 로그인 화면으로 리디렉션 기획에 따라 필요한 곳으로 리디렉션 가능
  passport.authenticate('google', {
    // 프론트 로그인 페이지로 리디렉션
    failureRedirect: '/login',
    // 개발 이후 true로 변경
    // session: false,
  }),
  authController.googleCallback
);

module.exports = router;