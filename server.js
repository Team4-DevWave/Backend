const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const {Server} = require('socket.io');
const http = require('http');
const chatroomModel = require('./models/chatroommodel');
const chatMessageModel = require('./models/chatmessagemodel');
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
        try {
          const decoded = (jwt.verify)(token, process.env.JWT_SECRET);
          socket.userID = decoded.userID;
          next();
        } catch (err) {
          console.log(err);
        }
      });
      io.on('connection', (socket) => {
        socket.on('join rooms', async () => {
          // Check if a chatroom with the given ID exists
          const rooms = await chatroomModel.find({chatroomMembers: {$in: [socket.userID]}}).select('_id').exec();
          const roomIds = rooms.map((room) => room._id.toString());
          const joinedRooms = Array.from(socket.rooms);
          joinedRooms.forEach((roomId) => {
            if (!roomIds.includes(roomId)) {
              socket.leave(roomId);
            }
          });
          roomIds.forEach((roomId) => socket.join(roomId));
        });
        socket.on('leave room', (roomID) => {
          socket.leave(roomID);
        });
        socket.on('new message', async (message) => {
          const room=await chatroomModel.findOne({chatroomMembers: {$in: [socket.userID]},
            _id: message.roomID});
          if (room) {
            io.in(message.roomID).emit('message received', message);
            const chatMessage = await chatMessageModel.create({
              sender: socket.userID,
              message: message.content,
              chatID: room._id,
            });
            room.latestMessage = chatMessage._id;
            await room.save();
          }
        });
      });
      socketServer.listen(socketPort, () => { // Start the Socket.IO server on port 3005
        console.log(`Socket.IO server running on port ${socketPort}...`);
      });
    })
    .catch((err) => {
      console.log('ERROR');
    });

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
