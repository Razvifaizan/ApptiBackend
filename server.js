import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import questionRoutes from "./routes/question.js";
import testRoutes from "./routes/test.js";
import User from "./models/user.js"; // ✅ Model ka import sahi naam se
import scoreRoutes from "./routes/score.js";
import TestResult from "./models/TestResult.js";
import googleAuthRoutes from './routes/authRoutes.js'
import githubAuthRoutes from './routes/githubAuthRoutes.js'



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ User Profile Route
// app.get("/api/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id); // ✅ Model ka use
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ us user ke saare attempts fetch karo
    const attempts = await TestResult.find({ userId: req.params.id })
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    res.json({
      ...user,
      attempts: attempts.map((a) => ({
        score: a.score,
        date: a.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/auth/github", githubAuthRoutes);
// api/auth

app.use("/api", scoreRoutes);


// ✅ DB connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
