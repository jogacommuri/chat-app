import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User'; // Import the IUser interface for user references
import { IMessage } from './Message';

export interface IChatRoom extends Document {
  name: string;
  description: string;
  messages: IMessage[]; // Store messages as an array of references to Message documents
  users: mongoose.Types.ObjectId[]; 
}

const chatRoomSchema: Schema<IChatRoom> = new Schema({
  name: String,
  description: String,
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], // Reference to Message documents
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Reference to User documents
});

const ChatRoom: Model<IChatRoom> = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);

export default ChatRoom;

