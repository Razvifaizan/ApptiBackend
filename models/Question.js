import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  level: { type: String, enum: ["Easy", "Medium", "Advanced"], required: true },
  question: String,
  options: [String],
  answer: String
});

export default mongoose.model("Question", questionSchema);
