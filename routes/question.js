import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// ✅ Get ALL questions (must be on top)
router.get("/all", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add Question (Admin)
router.post("/", async (req, res) => {
  try {
    const q = new Question(req.body);
    await q.save();
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get Random Questions by Level
router.get("/:level", async (req, res) => {
  const { level } = req.params;
  try {
    const questions = await Question.aggregate([
      { $match: { level } },
      { $sample: { size: 5 } } // 5 random questions
    ]);
    res.json(questions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Update question
router.put("/:id", async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete question
router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// POST /api/results/save
// router.post("/save", async (req, res) => {
//   try {
//     const { userId, score, totalQuestions, correctAnswers, wrongAnswers, topicStats } = req.body;

//     const result = new Result({
//       userId, score, totalQuestions, correctAnswers, wrongAnswers, topicStats
//     });
//     await result.save();

//     // update user stats
//     const user = await User.findById(userId);
//     user.totalAttempts += 1;
//     user.highestScore = Math.max(user.highestScore, score);
//     user.averageScore =
//       ((user.averageScore * (user.totalAttempts - 1)) + score) / user.totalAttempts;

//     // update weak topics
//     topicStats.forEach(stat => {
//       if (stat.wrong > stat.correct) {
//         const existing = user.weakTopics.find(t => t.topic === stat.topic);
//         if (existing) {
//           existing.wrongCount += stat.wrong;
//         } else {
//           user.weakTopics.push({ topic: stat.topic, wrongCount: stat.wrong });
//         }
//       }
//     });

//     await user.save();
//     res.json({ success: true, result });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


export default router;
