const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const {Server} = require('socket.io');
const http = require('http');
const chatroomModel = require('./models/chatroommodel');
const jwt = require('jsonwebtoken');
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
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
const socketPort = 3005;
const socketServer = http.createServer(); // Create a new HTTP server for the Socket.IO server
const io = new Server(socketServer,
    {
      pingTimeout: 600000,
      cors: {
        origin: 'http://localhost:3000', // removed a /   to test
      },
    });
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userID = decoded.id;
    next();
  });
});
io.on('connection', (socket) => {
  socket.on('setup', () => {
    socket.join(socket.userID);
    socket.emit('connected', socket.userID);
  });
  socket.on('join room', async (roomID) => {
    // Check if a chatroom with the given ID exists
    const chatroom = await chatroomModel.findById(roomID);
    if (!chatroom) {
      return socket.emit('error', 'Chatroom not found');
    }
    socket.join(roomID);// validation needed
  });
  socket.on('leave room', (roomID) => {
    socket.leave(roomID);
  });
  socket.on('new message', (message) => {
    io.in(message.roomID).emit('message received', message.content);
  });
});
socketServer.listen(socketPort, () => { // Start the Socket.IO server on port 3005
  console.log(`Socket.IO server running on port ${socketPort}...`);
});
