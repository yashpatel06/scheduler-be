import mongoose, { Schema, Document, model } from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  statusFrom: {
    type: String,

    enum: ["Pending", "Finished", "Unfinished", "Other"],
  },
  statusTo: {
    type: String,

    enum: ["Pending", "Finished", "Unfinished", "Other"],
  },
  updatedAt: {
    type: Date,

    default: Date.now,
  },
  updatedBy: {
    type: String,
  },
  remarks: {
    type: String,
  },
});

const actionItemSchema = new mongoose.Schema({
  purpose: {
    type: String,
    required: true,
  },
  remark: {
    type: String,
    default: "",
  },
  nextPlan: {
    type: String,
    default: "",
  },
});

const actionSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  requestRemark: {
    type: String,
    default: "",
  },
  visitDate: {
    type: Date,
    required: true,
  },
  placeVisit: {
    type: String,
    required: true,
  },
  visitType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    // required: true,
    enum: ["Pending", "Finished", "Unfinished", "Other"],
    default: "Pending",
  },
  statusHistory: [statusHistorySchema],
  action: [actionItemSchema],
});

const Action = model("Action", actionSchema, "action");
export default Action;
