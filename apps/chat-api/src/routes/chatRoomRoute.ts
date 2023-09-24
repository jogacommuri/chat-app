import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';

import ChatRoom, { IChatRoom } from '../models/ChatRooms';
import Message from '../models/Message';

import jwt from 'jsonwebtoken';


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
router.post('/join/:roomId', async (req: Request, res: Response) => {
  const roomId: string = req.params.roomId;
  const token: string | undefined = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify the user's token and get user information
    const userInfo: { id: string , firstName: string, lastName: string, email: string, password: string} = jwt.verify(token, secret) as { id: string , firstName: string, lastName: string, email: string, password: string};

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

    // Save the updated chat room
    await chatRoom.save();

    // Optionally, you can send back the updated chat room data to the client
    res.status(200).json({ message: 'Successfully joined the chat room', chatRoom });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ error: 'Failed to join the chat room' });
  }
});
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
// Get chat messages for a specific chat room
router.get('/chatroom/:roomId/messages', async (req, res) => {
  const roomId = req.params.roomId;

  try {
    // Use MongoDB aggregation to join messages with user names
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
          'senderInfo._id':1
        }
      }
    ]);

    // Optionally, you can also fetch the chat room name
    const chatRoom = await ChatRoom.findById(roomId, 'name');

    res.json({
      chatRoomName: chatRoom.name,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat room messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat room messages' });
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
