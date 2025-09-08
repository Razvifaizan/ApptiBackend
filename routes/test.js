import express from "express";
import TestResult from "../models/TestResult.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Save Test Result + Send Mail

router.get("/", async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ highestScore: -1 })
      .limit(10)
      .select("name highestScore totalAttempts");

    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/submit", async (req, res) => {
  const { userId, level, score, total } = req.body;

  try {
    const result = new TestResult({ userId, level, score, total });
    await result.save();

    const user = await User.findById(userId);

    // Mailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Test Result",
      text: `You completed ${level} Test.\nScore: ${score}/${total}`,
    });

    res.json({ msg: "Result saved & emailed", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
