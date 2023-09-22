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

import jwt from 'jsonwebtoken';
import User from './models/User';
const app = express();
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

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
