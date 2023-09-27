import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';

import ChatRoom, { IChatRoom } from '../models/ChatRooms';
import Message from '../models/Message';
import User,{IUser} from '../models/User'
import jwt from 'jsonwebtoken';

const ObjectId = mongoose.Types.ObjectId;

const router: Router = express.Router();

// Create a new chat room
router.post('/chatrooms', async (req: Request, res: Response) => {
  try {
    const { name, description, users }: IChatRoom = req.body;
    const newRoom = new ChatRoom({ name, description, users });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat room' });
  }
});

// Get all chat rooms
router.get('/chatrooms', async (req: Request, res: Response) => {
  try {
    const chatRooms: IChatRoom[] = await ChatRoom.find().populate('users').exec();
    res.json(chatRooms);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat rooms' });
  }
});

const secret = "SECRET_1234";


// Get a specific chat room by ID
router.get('/chatrooms/:id', async (req: Request, res: Response) => {
  try {
    const roomId: string = req.params.id;
    const chatRoom: IChatRoom | null = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat room' });
  }
});


router.get('/chatroom/:roomId/messages', async (req, res) => {
  const roomId = req.params.roomId;
  if (!ObjectId.isValid(roomId)) {
    return res.status(400).json({ error: 'Invalid roomId format' });
  }
  try {
    // Use MongoDB aggregation to join messages with user names and additional attributes
    const messages = await Message.aggregate([
      {
        $match: { chatRoomId: new mongoose.Types.ObjectId(roomId) }
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
          'senderInfo._id': 1,
          'systemMessage': 1, 
        }
      }
    ]);

    // Fetch the chat room and its users
    const chatRoom: IChatRoom | null = await ChatRoom.findById(roomId)
      .populate('users','-password') // Populate the 'users' field with user documents
      .exec();

    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    
    const userObjectIds: mongoose.Types.ObjectId[] = [];

    // Iterate through users and add their IDs to the array
    chatRoom.users.forEach((userObjectId) => {
      userObjectIds.push(userObjectId);
    });

    // Optionally, fetch additional attributes for users here
    const usersWithAdditionalAttributes: IUser[] = await User.find({
      _id: { $in: userObjectIds }, // Filter users by their IDs
    });

   
    res.json({
      chatRoomName: chatRoom.name,
      chatRoomUsers: usersWithAdditionalAttributes,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat room messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat room messages' });
  }
});

router.post('/join/:roomId', async (req: Request, res: Response) => {
  const roomId: string = req.params.roomId;
  const token: string | undefined = req.headers.authorization;;
  const {firstName, lastName} =  req.body
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify the user's token and get user information
    const userInfo: { id: string , firstName: string, lastName: string, email: string, password: string} = 
    jwt.verify(token, secret) as { id: string , firstName: string, lastName: string, email: string, password: string};

    //console.log(JSON.stringify(userInfo))
    // Find the chat room by ID
    const chatRoom: IChatRoom | null = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Check if the user is already a participant in the chat room
    const userId: string = userInfo.id.toString();
    const userIsParticipant: boolean = chatRoom.users.some((user) => user.toString() === userId);


    if (userIsParticipant) {
      return res.status(400).json({ error: 'User is already in the chat room' });
    }
    const userIdObject = new mongoose.Types.ObjectId(userId);
     // Add the user's ID to the chat room's participants list
     chatRoom.users.push(userIdObject);

    const joinMessage = new Message({
      senderInfo: userInfo.id, // Reference to the user who joined
      text: `${firstName} ${lastName} has joined the chat.`,
      chatRoomId: roomId, // Reference to the chat room
      systemMessage: true, // Set as a system message
    });
    // Save the updated chat room
    await Promise.all([chatRoom.save(), joinMessage.save()]);

    // Optionally, you can send back the updated chat room data to the client
    res.status(200).json({ message: 'Successfully joined the chat room', chatRoom });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ error: 'Failed to join the chat room' });
  }
});

router.post('/leave/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const token: string | undefined = req.headers.authorization;;
  const {firstName, lastName} =  req.body
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Remove the user from the chat room in the database
    // For example, if you have a "chatRoom" model, you can use Mongoose to update it
    // Update the database to remove the user from the room's user list
    const userInfo: { id: string , firstName: string, lastName: string, email: string, password: string} = jwt.verify(token, secret) as { id: string , firstName: string, lastName: string, email: string, password: string};
    //console.log(JSON.stringify(userInfo))
    const chatRoom: IChatRoom | null = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Check if the user is a participant in the chat room
    const userId: string = userInfo.id.toString();
    const userIndex: number = chatRoom.users.findIndex((user) => user.toString() === userId);

    if (userIndex === -1) {
      return res.status(400).json({ error: 'User is not in the chat room' });
    }

    chatRoom.users.splice(userIndex, 1);

   
    const leaveMessage = new Message({
      senderInfo: userInfo.id, 
      text: `${firstName} ${lastName} has left the chat.`,
      chatRoomId: roomId, 
      systemMessage: true, 
    });

    
    await Promise.all([chatRoom.save(), leaveMessage.save()]);

    res.status(200).json({ message: 'Successfully left the chat room' });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a chat room by ID
router.put('/chatrooms/:id', async (req: Request, res: Response) => {
  try {
    const roomId: string = req.params.id;
    const { name, description, users }: IChatRoom = req.body;
    const updatedRoom: IChatRoom | null = await ChatRoom.findByIdAndUpdate(
      roomId,
      { name, description, users },
      { new: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error updating chat room' });
  }
});

// Delete a chat room by ID
router.delete('/chatrooms/:id', async (req: Request, res: Response) => {
  try {
    const roomId: string = req.params.id;
    const deletedRoom: IChatRoom | null = await ChatRoom.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json({ message: 'Chat room deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting chat room' });
  }
});

export default router;
