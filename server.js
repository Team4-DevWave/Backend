const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const {Server} = require('socket.io');
const http = require('http');
const catchAsync = require('./utils/catchasync');
const chatroomModel = require('./models/chatroommodel');
const chatMessageModel = require('./models/chatmessagemodel');
const userModel = require('./models/usermodel');
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
      io.use(catchAsync(async (socket, next) => {
        const token = socket.handshake.query.token;
        const decoded = (jwt.verify)(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userID);
        socket.userID = user._id.toString();
        socket.username = user.username;
        next();
      }));
      io.on('connection', (socket) => {
        socket.on(('login'), catchAsync(async (token) => {
          const decoded = (jwt.verify)(token, process.env.JWT_SECRET);
          const user = await userModel.findById(decoded.userID);
          socket.userID = user._id.toString();
          socket.username = user.username;
        }));
        socket.on('join rooms', catchAsync( async () => {
          // Check if a chatroom with the given ID exists
          const rooms = await chatroomModel.find({chatroomMembers: {$in: [socket.userID]}}).select('_id').exec();
          const roomIds = rooms.map((room) => room._id.toString());
          roomIds.forEach((roomId) => socket.join(roomId));
        }));
        socket.on('leave room', (roomID) => {
          socket.leave(roomID);
        });
        socket.on('new message', catchAsync( async (message) => {
          const room=await chatroomModel.findOne({chatroomMembers: {$in: [socket.userID]},
            _id: message.roomID});
          if (room) {
            let chatMessage = await chatMessageModel.create({
              sender: socket.userID,
              message: message.message,
              chatID: room._id,
            });
            chatMessage = await chatMessage.populate('chatID');
            io.in(message.roomID).emit('message received', chatMessage);
            room.latestMessage = chatMessage._id;
            await room.save();
          }
        }));
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
