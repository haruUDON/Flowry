const express = require('express');
const http = require('http'); //new
const path = require('path');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

require('dotenv').config();

const PORT = 3000;

//データベース接続

mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true , useUnifiedTopology: true })
.then(() => console.log("db connected"))
.catch((err) => console.log(err));

//ルーター

const routes = require('./routes/index');
const login = require('./routes/login');
const logout = require('./routes/logout');
const signup = require('./routes/signup');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const follow = require('./routes/follow');
const post = require('./routes/post.js');
const like = require('./routes/like.js');
const bookmarks = require('./routes/bookmarks.js');
const notifications = require('./routes/notifications.js');
const search = require('./routes/search.js');
const api = require('./routes/api.js');
const deleteAccount = require('./routes/delete-account');

//サーバーオブジェクト

const app = express();
const server = http.createServer(app); //new
const io = socketIO(server); //new

app.use((req, res, next) => {
    req.io = io;
    next();
});

//セッション管理

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        mongooseConnection: mongoose.createConnection(process.env.MONGODB_URL, { useNewUrlParser: true , useUnifiedTopology: true }),
        collectionName: 'sessions',
        ttl: 60 * 60 * 12 //セッションをデータベースから削除するまでの時間(sec)
    }),
    cookie: {
        httpOnly: true, // cookieへのアクセスをHTTPのみに制限
        maxAge: 60 * 60 * 1000 * 12 // クッキーの有効期限(msec)
    }
}));

//viewエンジン

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//モジュール適用

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ルーター適用

app.use('/', routes);
app.use('/login', login);
app.use('/logout', logout);
app.use('/signup', signup);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/follow', follow);
app.use('/post', post);
app.use('/like', like);
app.use('/bookmarks', bookmarks);
app.use('/notifications', notifications);
app.use('/search', search);
app.use('/api', api);
app.use('/delete-account', deleteAccount);

//socket.io

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('connected', { socketId: socket.id });
    // ユーザーが切断したときの処理
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 例外処理

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (process.env.NODE_ENV === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message
        });
    });
}

app.use((err, req, res, next) => {
    if (err.message === 'Post not found'){
        res.status(400).render('error', { message: "投稿が見つかりませんでした" });
        return;
    }
    if (err.message === 'User not found'){
        res.status(400).render('error', { message: "ユーザーが見つかりませんでした" });
        return;
    }
    if (err.message === 'User was deleted'){
        res.status(400).render('error', { message: "削除されたユーザーです" });
        return;
    }
    if (err.message === 'Permission denied'){
        res.status(500).render('error', { message: "この操作に必要な権限がありません" });
        return;
    }
    res.status(500).render('error', { message: "予期せぬエラーが発生しました" });
});

// サーバーオブジェクトのエクスポート

module.exports = app;


server.listen(PORT, console.log("server running"));