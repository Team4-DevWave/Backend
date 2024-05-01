const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const {Server} = require('socket.io');
const http = require('http');
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
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData.id);
    console.log(userData);
    socket.emit('connected', userData.id);
  });
  socket.on('join room', (roomID) => {
    socket.join(roomID);// validation needed
  });
  // TODO LEAVE ROOM

  socket.on('new message', (message) => {
    socket.to(message.roomID).emit('message received', message.content);
    socket.emit('message received', message.content); // remove if handled by backend
  });
});
socketServer.listen(socketPort, () => { // Start the Socket.IO server on port 3005
  console.log(`Socket.IO server running on port ${socketPort}...`);
});
