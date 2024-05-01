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
        origin: 'http://localhost:3000/',
      },
    });
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData.id);
    console.log(userData);
    socket.emit('connected', userData.id);
  });
  socket.on('join room', (roomID) => {
    socket.join(1);// recieve the room id
  });
  // TODO LEAVE ROOM
  socket.on('typing', (roomID) => socket.in(roomID).emit('typing'));
  socket.on('stop typing', (roomID) => socket.in(roomID).emit('stop typing'));

  socket.on('new message', (newMessageRecieve) => {
    const chat = newMessageRecieve;
    console.log(chat);
    socket.to(1).emit('message recieved', ()=>{
      console.log('message recieved', chat.message);
      return chat.message;
    });
  });
});
socketServer.listen(socketPort, () => { // Start the Socket.IO server on port 3005
  console.log(`Socket.IO server running on port ${socketPort}...`);
});
