import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: string | mongoose.Types.ObjectId;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);
