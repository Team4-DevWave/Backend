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
      // pingTimeout: 60000,
      cors: {
        origin: 'http://localhost:3000/',
      },
    });
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData.id);
    socket.emit('connected');
  });
  socket.on('error', (error) => {
    console.log('Socket Error', error);
  });
  socket.on('join room', (roomID) => {
    socket.join(roomID);// recieve the room id
  });
  socket.on('typing', (roomID) => socket.in(roomID).emit('typing'));
  socket.on('stop typing', (roomID) => socket.in(roomID).emit('stop typing'));

  socket.on('new message', async (newMessageRecieve) => {
    const chat = newMessageRecieve;
    console.log(chat);
    if (!chat.chatroomMembers) {
      console.log('hello empty');
      return;
    }
    socket.in(newMessageRecieve.chatID).emit('message recieved', (message)=>{
      console.log('Received a message:', message);
    });
  });
});
socketServer.listen(socketPort, () => { // Start the Socket.IO server on port 3005
  console.log(`Socket.IO server running on port ${socketPort}...`);
});
