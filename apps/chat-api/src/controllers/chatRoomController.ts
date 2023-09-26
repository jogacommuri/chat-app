import ChatRoom from "../models/ChatRooms";

// Create a new chat room
exports.createChatRoom = async (req, res) => {
  const { name, description, users } = req.body;
  try {
    const newRoom = new ChatRoom({ name, description, users });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat room' });
  }
};

// Get all chat rooms
exports.getAllChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find();
    res.json(chatRooms);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat rooms' });
  }
};

// Get a specific chat room by ID
exports.getChatRoomById = async (req, res) => {
  const roomId = req.params.id;
  try {
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat room' });
  }
};

// Update a chat room by ID
exports.updateChatRoomById = async (req, res) => {
  const roomId = req.params.id;
  const { name, description, users } = req.body;
  try {
    const updatedRoom = await ChatRoom.findByIdAndUpdate(
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
};

// Delete a chat room by ID
exports.deleteChatRoomById = async (req, res) => {
  const roomId = req.params.id;
  try {
    const deletedRoom = await ChatRoom.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    res.json({ message: 'Chat room deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting chat room' });
  }
};
