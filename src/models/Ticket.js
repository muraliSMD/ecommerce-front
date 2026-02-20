import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional linked order
  status: { 
      type: String, 
      enum: ["Open", "In Progress", "Closed"], 
      default: "Open" 
  },
  priority: { 
      type: String, 
      enum: ["Low", "Medium", "High"], 
      default: "Medium" 
  },
  messages: [
    {
      sender: { type: String, enum: ["user", "admin"], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      attachment: { type: String } // Optional URL for image/file
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Ticket;
}

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
