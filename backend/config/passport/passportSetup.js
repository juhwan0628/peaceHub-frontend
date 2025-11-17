const passport = require('passport'); // require passport middleware
const prisma = require('../../prismaClient'); // 세션 확인을 위한 db 접근
const googleStrategy = require('./google.strategy'); // google 로그인 기능 사용

module.exports = () => {
  // 로그인 성공 시 사용자 정보 중 user 객체에서 id만 저장
  passport.serializeUser((user, done) => {
    done(null, user.id); 
  });

  passport.deserializeUser(async (id, done) => {
    try {
      // 세션에서 user id를 검색하여 user 객체 전체를 반환해서 req.user 객체에 저장
      const user = await prisma.user.findUnique({
        // db에 저장된 id : 파라미터 id 비교
        where: { id: id },
      });
      // 에러 없음, user 정보 반환
      done(null, user); 
    } catch (error) {
      done(error);
    }
  });

  // 세션 관리 전역 설정 이후 로그인 기능 구현, 추후 이메일, 카카오톡 등 확장을 위한 분리
  googleStrategy();
};