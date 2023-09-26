import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the interface for a user document
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Define the schema for users
const userSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;