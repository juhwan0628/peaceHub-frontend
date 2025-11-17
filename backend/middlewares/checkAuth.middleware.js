/** 로그인 유저인지 확인하는 미들웨어
 * 로그인 이후 모든 활동에서 세션 인증을 거쳐 진행
*/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 로그인이 되어있다면 다음 미들웨어, 혹은 라우터 핸들러로 전달
    next();
  } else {
    // 로그인이 되어있지 않다면 401 Unauthorized 에러 전달. front에서는 error catch로 로그인 페이지로 리디렉션
    res.status(401).json({ message: 'need login' });
  }

};
module.exports = {
  isLoggedIn,
};