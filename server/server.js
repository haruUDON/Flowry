const express = require('express');
const app = express();

const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const axios = require('axios');

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

require('dotenv').config();

const PORT = 5000;

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("db connected"))
.catch((err) => console.log(err));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        mongooseConnection: mongoose.createConnection(process.env.MONGODB_URL),
        collectionName: 'sessions',
        ttl: 60 * 60 * 12
    }),
    cookie: {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 * 12
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const users = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // ユーザーが接続したときにユーザーIDを保存
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  socket.on('like', (data) => {
    const { postId, userId, postOwnerId } = data;
    console.log(`Post ${postId} liked by ${userId}, notifying ${postOwnerId}`);

    // いいねされたユーザーに通知を送信
    const recipientSocketId = users[postOwnerId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // 切断されたユーザーをusersから削除
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

const api = require('./routes/api');
const login = require('./routes/login');
const logout = require('./routes/logout');

app.use('/api', api);
app.use('/login', login);
app.use('/logout', logout);

app.use('/uploads', express.static('uploads'));

// const Anime = require('./models/anime.js').Anime;

// const API_ENDPOINT = 'https://api.annict.com/v1/works';

// async function fetchDataAndSave(fields = 'id,title,title_kana,released_on,season_name,episodes_count,no_episodes,watchers_count', page = 1, perPage = 50, sortSeason = 'desc') {
//     try {
//       const response = await axios.get(API_ENDPOINT, {
//         params: {
//           access_token: process.env.ANNICT_ACCESS_TOKEN,
//           fields,
//           page,
//           per_page: perPage,
//           sort_season: sortSeason
//         }
//       });

//       const works = response.data.works;
  
//       await Anime.insertMany(works);
//       console.log('Fetched data from page', page);

//       if (response.data.total_count > page * perPage) {
//         await fetchDataAndSave(fields, page + 1, perPage, sortSeason);
//       } else {
//         console.log('All data fetched successfully.');
//       }
//     } catch (error) {
//       console.error('Error fetching and saving data:', error);
//     }
// }

app.listen(PORT, () => {console.log("Server started on port 5000")});

module.exports = app;