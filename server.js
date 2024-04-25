const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const {Server} = require('socket.io');
dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD,
);

mongoose
    .connect(DB)
    .then(() => {
      console.log('db connection success');
    })
    .catch((err) => {
      console.log('ERROR');
    });

const port = process.env.PORT || 8000;
const server= app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

const io = new Server(server,
    {
      pingTimeout: 60000,
      cors: {
        origin: 'http://localhost:3005',
      },
    });
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData.id);
    socket.emit('connected');
  });
  socket.on('join room', (room) => {
    socket.join(room);
  });
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieve) => {
    const chat = newMessageRecieve.chatID;
    if (!chat.chatroomMembers) console.log('chats.chatroomMembers is not defined');
    chat.chatroomMembers.forEach((user) => {
      if (user._id == newMessageRecieve.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieve);
    });
  });
});
