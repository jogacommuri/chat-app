import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User'; // Import the IUser interface for user references
import { IChatRoom } from './ChatRooms';

export interface IMessage extends Document {
  senderInfo: IUser; // Reference to the sender's User document
  text: string;
  timestamp: Date;
  chatRoomId: IChatRoom; // Reference to the ChatRoom document
  systemMessage: boolean;
}

const messageSchema: Schema<IMessage> = new Schema({
  senderInfo: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User documents
  text: String,
  timestamp: { type: Date, default: Date.now },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
  systemMessage: { type: Boolean, default: false }
});

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

export default Message;


