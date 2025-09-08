import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  topicStats: [
    {
      topic: String,
      correct: Number,
      wrong: Number,
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TestResult", testResultSchema);
