import { model, Schema } from "mongoose";

export interface UserInterface {
  firstName: string;
  lastName: string;
  password: string;
  mobileNumber: string;
  email: string;
  profilePic: Buffer;
}

const userSchema = new Schema<UserInterface>({
  firstName: String,
  lastName: String,
  password: String,
  mobileNumber: String,
  email: String,
  profilePic: Buffer,
});

const User = model<UserInterface>("User", userSchema);

export default User;
