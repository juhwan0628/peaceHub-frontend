const prisma = require('../prismaClient'); // require db

const findOrCreateUser = async (profile) => {
  const exUser = await prisma.user.findUnique({
    // googleId로 db 검색
    where: { googleId: profile.id },
  });

  // db에 googleId 존재할 경우 기존 유저를 반환
  if (exUser) {
    return exUser; 
  }
  
  // db에 사용자 정보가 없으면 email, name, googleId를 입력받아 create
  const newUser = await prisma.user.create({
    data: {
      email: profile.emails[0].value,
      name: profile.displayName,
      googleId: profile.id,
    },
  });
  return newUser;
};

module.exports = { findOrCreateUser };