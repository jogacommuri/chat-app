/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose, { ConnectOptions } from "mongoose";
import bcrypt from 'bcrypt';
import * as http from 'http';
import { Server as SocketIO } from "socket.io";

import jwt from 'jsonwebtoken';

import User from './models/User';
import ChatRoom from './models/ChatRooms';
import Message from './models/Message'


import ChatRoomRoutes from './routes/chatRoomRoute';

interface UserInfo {
  id: string;
  // Other properties...
}

const app = express();
const server = http.createServer(app);
const io:SocketIO = new SocketIO(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000, // Interval between pings (e.g., 10 seconds)
  pingTimeout: 5000,  
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// const uri = "mongodb+srv://admin:admin1234@cluster0.byt74xc.mongodb.net/?retryWrites=true&w=majority";

//app.use('/assets', express.static(path.join(__dirname, 'assets')));

const MONGO_URI = "mongodb+srv://admin:admin1234@cluster0.byt74xc.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI,  {} )

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));

app.get('/api/test', (req, res ) => {
  res.send({ message: 'Welcome to server!' });
});
const secret = "SECRET_1234";

app.get('/api/user',(req, res)=>{

  //const token = req.cookies.token;
  const token = req.headers.authorization;
  //console.log("decoded",token)
   
  const userInfo: UserInfo = jwt.verify(token, secret) as UserInfo;
  // console.log("decoded",userInfo)
    
      User.findById(userInfo.id)
      .then((user) => {const{_id,email, firstName, lastName} = user; res.json({_id,email, firstName, lastName})})
      .catch((err) =>{
        console.log(err);
        res.sendStatus(500)
      })
  
});

app.post('/api/register', (req,res) =>{
  const {email, firstName, lastName} =  req.body;
  //console.log(req.body);
  const password = bcrypt.hashSync(req.body.password, 10);

  const user = new User({email, firstName, lastName, password});

  user.save().then((user) =>{

   jwt.sign({id:user._id}, secret, (err,token) =>{
    if(err){
      console.log(err)
      res.sendStatus(500)
    }else{
      res.status(201).cookie('token', token).send();
    }
   });
  }).catch(e =>{
    console.log(e)
    res.sendStatus(500)
  })
});

app.post('/api/login', (req,res)=>{
  const {email, password} = req.body;

  User.findOne({email}).then(user => {
    if(user && user.email){
      const passOk = bcrypt.compareSync(password, user.password);
      // res.json({passOk});
      if(passOk){
        jwt.sign({id:user._id}, secret, (err, token)=>{
          const {firstName,lastName, email, _id} = user;
          const responseData = {
            message: "Login successful",
            data: {firstName,lastName, email,_id}
           
          };
          res.cookie('token',token);
          
          res.status(200).json({_id,email, firstName, lastName,token});
          //res.json({_id,email, firstName, lastName})
        })
      }else{
        res.sendStatus(422).json("Invalid Username or password");
    
      }
    }else{
      res.sendStatus(422).json("Invalid Username or password");
    }
  })
});

// Use chat room routes
app.use('/api', ChatRoomRoutes);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);


const activeUsers = new Map();


io.on('connection', (socket) => {
  socket.emit('connectionStatus', 'active');
  console.log(`User connected: ${socket.id}`);
  // When a user joins a specific chat room, emit a message to that room
  socket.on('joinRoom', async (chatRoomId,user) => {
    socket.join(chatRoomId);
    console.log(`${user.firstName} ${user.lastName} has joined the chat room - ${chatRoomId}.`);
    try {
      // Use MongoDB aggregation to join messages with user names
      const messages = await Message.aggregate([
        {
          $match: { chatRoomId: new mongoose.Types.ObjectId(chatRoomId) }
        },
        {
          $lookup: {
            from: 'users', // Assuming your user collection is named 'users'
            localField: 'senderInfo',
            foreignField: '_id',
            as: 'senderInfo'
          }
        },
        {
          $unwind: '$senderInfo'
        },
        {
          $project: {
            text: 1,
            timestamp: 1,
            'senderInfo.firstName': 1,
            'senderInfo.lastName': 1,
            'senderInfo._id':1,
            'systemMessage': 1, 
          }
        }
      ]);
  
      socket.to(chatRoomId).emit('systemMessage', messages);
      
    } catch (error) {
      console.error('Error fetching chat room messages:', error);
      // res.status(500).json({ error: 'Failed to fetch chat room messages' });
    }
    

    activeUsers.set(socket.id, { chatRoomId: chatRoomId, user });
  });

  socket.on('leaveRoom', async (chatRoomId,user,) => {
    // const userData = activeUsers.get(socket.id);
    // socket.leave(chatRoomId);
    // console.log(`${user.firstName} ${user.lastName} has left the chat room.`);
    // io.to(chatRoomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);

    // // Remove the user from the 'users' Map
    // activeUsers.delete(socket.id);
    // if (userData) {
    //   const { user } = userData;
      
      // socket.leave(chatRoomId);
      console.log(`${user.firstName} ${user.lastName} has left the chat room.`);
      
      try {
        // Use MongoDB aggregation to join messages with user names
        const messages = await Message.aggregate([
          {
            $match: { chatRoomId: new mongoose.Types.ObjectId(chatRoomId) }
          },
          {
            $lookup: {
              from: 'users', // Assuming your user collection is named 'users'
              localField: 'senderInfo',
              foreignField: '_id',
              as: 'senderInfo'
            }
          },
          {
            $unwind: '$senderInfo'
          },
          {
            $project: {
              text: 1,
              timestamp: 1,
              'senderInfo.firstName': 1,
              'senderInfo.lastName': 1,
              'senderInfo._id':1,
              'systemMessage': 1, 
            }
          }
        ]);
    
        socket.to(chatRoomId).emit('systemMessage', messages);
        console.log(`Emitting ${JSON.stringify(messages)}to chatRoom - ${chatRoomId} as systemMessage`)
        
      } catch (error) {
        console.error('Error fetching chat room messages:', error);
        // res.status(500).json({ error: 'Failed to fetch chat room messages' });
      }
      // Remove the user from the 'activeUsers' Map
      socket.leave(chatRoomId);
      activeUsers.delete(socket.id);
    // }
  });
  
  
  socket.on('chatMessage', async (chatRoomId, user, messageText) => {
    socket.join(chatRoomId);
    try {
      // Ensure that the message object contains necessary properties
      if (!chatRoomId || !user || !messageText) {
        console.error('Invalid message received:', {chatRoomId, user, messageText});
        return;
      }
      // const message = data.message
      console.log(`Received message from ${JSON.stringify(user)} in room ${chatRoomId}: ${messageText}`);

      // Create a new message instance
      const newMessage = new Message({
        senderInfo: user,
        text: messageText,
        chatRoomId: chatRoomId
      });

      // Save the message to the database
      await newMessage.save();
      console.log('Message saved to the database');
      //socket.join(message.chatRoomId)
      // Broadcast the message to all connected clients
      try {
        // Use MongoDB aggregation to join messages with user names
        const messages = await Message.aggregate([
          {
            $match: { chatRoomId: new mongoose.Types.ObjectId(chatRoomId) }
          },
          {
            $lookup: {
              from: 'users', // Assuming your user collection is named 'users'
              localField: 'senderInfo',
              foreignField: '_id',
              as: 'senderInfo'
            }
          },
          {
            $unwind: '$senderInfo'
          },
          {
            $project: {
              text: 1,
              timestamp: 1,
              'senderInfo.firstName': 1,
              'senderInfo.lastName': 1,
              'senderInfo._id':1,
              'systemMessage': 1, 
            }
          }
        ]);
    
        // Optionally, you can also fetch the chat room name
        const chatRoom = await ChatRoom.findById(chatRoomId, 'name');
        console.log(`Recent message - ${JSON.stringify(messages[messages.length -1])} in room ${chatRoomId}`)
        socket.to(chatRoomId).emit('receive_message', messages);
      } catch (error) {
        console.error('Error fetching chat room messages:', error);
        // res.status(500).json({ error: 'Failed to fetch chat room messages' });
      }
     
    } catch (error) {
      console.error('Error handling message:', error);
    }
    
  });
   // Handle 'pong' messages
   socket.on('pong', () => {
    // You can optionally log or perform actions upon receiving a 'pong' message.
    console.log("ping pong connection on")
  });
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.emit('connectionStatus', 'disconnected');
    const userData = activeUsers.get(socket.id);

    // console.log(`User disconnected: ${socket.id}`);
    // io.to(chatRoomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);
    // socket.leave(chatRoomId);
    // activeUsers.delete(socket.id);
    if (userData) {
      const { roomId, user } = userData;

      // Remove the user from the 'activeUsers' Map
      activeUsers.delete(socket.id);

      // Emit a system message to notify other users when someone disconnects
      io.to(roomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);

      // Leave the room
      socket.leave(roomId);
    }

    
  });
});