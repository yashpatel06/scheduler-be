import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  role: "Sales" | "Manager" | "Head" | "VP";
  reportsTo: mongoose.Types.ObjectId;
  isDeleted: boolean;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Sales", "Manager", "Head", "VP"],
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const User = model<IUser>("User", UserSchema, "user");
export default User;
