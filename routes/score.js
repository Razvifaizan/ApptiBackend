// routes/score.js
import express from "express";
import User from "../models/User.js";
import TestResult from "../models/TestResult.js";
import nodemailer from "nodemailer"; // ✅ TestResult model import karo

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
      topicStats,
    });
    await newResult.save();

    // ✅ User model me attempts & highest score update karo
    user.totalAttempts = (user.totalAttempts || 0) + 1;
    if (!user.highestScore || score > user.highestScore) {
      user.highestScore = score;
    }
    await user.save();

    // ✅ Mail send karo
    const transporter = nodemailer.createTransport({
      service: "gmail", // ya smtp server
      auth: {
        user: process.env.EMAIL_USER, // apna gmail
        pass: process.env.EMAIL_PASS, // app password (gmail settings se generate karna hoga)
      },
    });

    const mailOptions = {
      from: `"Test App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Test Result",
      html: `
        <h2>Hi ${user.name},</h2>
        <p>Thank you for attempting the <b>Test</b>. Here are your results:</p>
        <ul>
          <li>Total Questions: ${totalQuestions}</li>
          <li>Correct Answers: ${correctAnswers}</li>
          <li>Wrong Answers: ${wrongAnswers}</li>
          <li><b>Final Score: ${score} / ${totalQuestions}</b></li>
        </ul>
        <p>Keep practicing and improve your performance 💪</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Score saved & email sent",
      user,
      attempt: newResult,
    });
  } catch (err) {
    console.error("❌ Error in /send-score:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
