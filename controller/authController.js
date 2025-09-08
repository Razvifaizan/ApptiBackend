import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // ✅ add bcrypt
import User from "../models/User.js";

// 👉 1. Check if user exists (for Google login)
export const googleCheck = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.json({ exists: false });
    }

    // ✅ Agar user hai to direct token do
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ exists: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google check failed" });
  }
};

// 👉 2. Google signup with password (hashed)
export const googleSignup = async (req, res) => {
  try {
    const { name, email, picture, googleId, password } = req.body;

    // agar pehle se user exist hai to error do
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // ✅ Password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Naya user banao
    user = new User({
      name,
      email,
      password: hashedPassword, // 🔑 hashed password
      googleId,
      avatar: picture,
    });

    await user.save();

    // ✅ JWT token banao
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google signup failed" });
  }
};
