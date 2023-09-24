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

  const token = req.cookies.token;
  // console.log("decoded",token)
   
  const userInfo = jwt.verify(token, secret)
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
  console.log(req.body);
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
          const {firstName,lastName, email} = user;
          const responseData = {
            message: "Login successful",
            data: {firstName,lastName, email}
            // Add any other data you want to send
          };
          res.cookie('token',token);
          
          res.status(200).json(responseData)
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


const onlineUsers: Map<string, string> = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  global.chatSocket = socket;
  socket.on("add-user", (userId) =>{
    onlineUsers.set(userId, socket.id)
  })
  socket.on("send-msg", (data: { to: string; msg: string }) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
  
  socket.on('chatMessage', async (data) => {
    try {
      // Ensure that the message object contains necessary properties
      if (!data.message || !data.message.senderInfo || !data.message.chatRoomId || !data.message.text) {
        console.error('Invalid message received:', data.message);
        return;
      }
      const message = data.message
      console.log(`Received message from ${JSON.stringify(message.senderInfo)} in room ${message.chatRoomId}: ${message.text}`);

      // Create a new message instance
      const newMessage = new Message({
        senderInfo: `${message.senderInfo._id}`,
        text: message.text,
        chatRoomId: message.chatRoomId
      });

      // Save the message to the database
      await newMessage.save();
      console.log('Message saved to the database');
      socket.join(message.chatRoomId)
      // Broadcast the message to all connected clients
      socket.to(message.chatRoomId).emit('receive_message', newMessage);
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
    // Remove the socket from the active connections map
    // activeConnections.delete(socket);
  });
});