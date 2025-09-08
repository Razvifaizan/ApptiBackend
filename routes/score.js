// routes/score.js
import express from "express";
import User from "../models/user.js";
import TestResult from "../models/TestResult.js"; // ✅ TestResult model import karo

const router = express.Router();

router.post("/send-score", async (req, res) => {
  try {
    const { userId, score, totalQuestions, correctAnswers, wrongAnswers, topicStats } = req.body;

    // user find karo
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ TestResult me ek naya attempt save karo
    const newResult = new TestResult({
      userId,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      topicStats
    });
    await newResult.save();

    // ✅ User model me attempts & highest score update karo
    user.totalAttempts = (user.totalAttempts || 0) + 1;
    if (!user.highestScore || score > user.highestScore) {
      user.highestScore = score;
    }

    await user.save();

    res.json({
      message: "Score saved",
      user,
      attempt: newResult, // frontend ko last attempt ka record bhej diya
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
