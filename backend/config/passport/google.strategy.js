const passport = require('passport'); // require passport middleware
const GoogleStrategy = require('passport-google-oauth20').Strategy; // require google auth
const authService = require('../../services/auth.service'); // require auth service

module.exports = () => {
  passport.use(
    // auth.router 안의 passport.authenticate 함수에서 읽어옴
    new GoogleStrategy(
      {
        // .env에서 환경 변수로 clientID, clientSecret key 사용. 보안에 유의
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // 로그인 성공 시 콜백 url 지정 auth.router에서 auth.controller googlecallback 호출
        callbackURL: '/api/auth/google/callback',
      },
      // google로부터 받아온 프로필 정보와 완료 신호 함수(done)를 인자로 전달
      async (accessToken, refreshToken, profile, done) => {
        try {
          // profile을 파라미터로 auth.service에서 메소드 실행
          const user = await authService.findOrCreateUser(profile);
          // db에 저장, 혹은 새로 생성된 user 객체가 serializeUser로 전달
          done(null, user);
        } catch (error) {
          done(error);
        }
      } 
    )
  );
};
