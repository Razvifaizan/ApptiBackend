import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  googleId: String,
  totalAttempts: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  weakTopics: [{ topic: String, wrongCount: Number }]
});

// ⚡ Ye line OverwriteModelError ko fix karegi
export default mongoose.models.Users || mongoose.model("Users", userSchema);
