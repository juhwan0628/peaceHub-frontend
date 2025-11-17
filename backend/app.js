const express = require('express'); // require express framework
const passport = require('passport'); // require passport middleware
const passportConfig = require('./config/passport/passportSetup'); // require passport setup file

const authRouter = require('./routes/auth.router'); // require auth router
const roomRouter = require('./routes/rooms.router'); // require room router
const userRouter = require('./routes/users.router'); // require user router
const scheduleRouter = require('./routes/schedules.router'); // require schedule router

const session = require('express-session'); // require express session middleware
const {isLoggedIn:checkAuth} = require('./middlewares/checkAuth.middleware'); // require session check middleware

const dotenv = require('dotenv'); // require env reader

// .env 파일에서 환경변수 읽어오기
dotenv.config();

const app = express();
const port = 8000;

// passport setup configuration
passportConfig();

app.use(express.json());

// setup express-session middleware
app.use(
  session({
    // use secret key from .env
    secret: process.env.SESSION_SECRET, 
    // true = 세션 데이터 변경이 없어도 요청마다 세션 새로 저장
    resave: false,
    // true = 로그인 하지 않은 사용자의 빈 세션 저장
    saveUninitialized: false, 
    cookie: {
      // true = JavaScript 코드로 쿠키 접근 방지
      httpOnly: true, 
      // true = http 환경 외에서 쿠키 전송 방지 개발할 땐 false로 두기
      secure: false, 
    },
  })
);

// initialize passport middleware
app.use(passport.initialize());

// add passport session middleware
// deserializeUser 함수로 로그인 세션 유지
app.use(passport.session()); 

// 로그인 라우터 연결
app.use('/api/auth', authRouter);

// 세션 인증 후 사용자 객체 반환 라우터 연결
app.use('/api/users', checkAuth, userRouter);

// 세션 인증 후 방 생성/참여 라우터 연결
app.use('/api/rooms', checkAuth, roomRouter);

// 세션 인증 후 시간표 설정 라우터 연결
app.use('/api/schedules', checkAuth, scheduleRouter);


app.get('/', (req, res) => {
  res.send('Server running');
});

app.listen(port, () => {
  console.log(`port num:${port}`);
});

// 테스트 진행을 위한 app export
module.exports = app;