/**
 * 로그인 과정에서는 통상적인 router -> controller -> service -> controller 대신 router -> middleware(service) -> controller로 진행
 * 구글과 통신하는 복잡한 로직을 라이브러리 모듈로 단순화
*/
const googleCallback = (req, res) => {
  // 정상 로그인 시 구글 로그인 페이지에서 다음 페이지로 리디렉션
  // res.redirect('http://localhost:8000/profile');
  console.log('Authenticated User:', req.user);

  // 테스트용 결과
  res.status(200).json({
    message: 'Google login successful',
    user: req.user,
  });
};

module.exports = {
  googleCallback,
};