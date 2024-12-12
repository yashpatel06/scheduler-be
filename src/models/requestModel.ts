import mongoose, { Schema, Document } from "mongoose";

export interface IRequest extends Document {
  createdBy: mongoose.Types.ObjectId;
  place: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "Pending" | "Approved" | "Rejected";
  statusHistory: {
    statusFrom: string;
    statusTo: string;
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
    remark: string;
  }[];
  isActive: boolean;
  isDeleted: boolean;
}

const RequestSchema: Schema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  place: { type: String, required: true },
  name: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  statusHistory: [
    {
      statusFrom: { type: String },
      statusTo: { type: String },
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      remark: { type: String },
    },
  ],
});

export default mongoose.model<IRequest>("Request", RequestSchema);
