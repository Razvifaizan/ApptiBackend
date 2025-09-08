import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";


export const githubCheck = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.json({ exists: false });
    }

  
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ exists: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub check failed" });
  }
};

// 👉 2. GitHub signup (with password if user set kare)
export const githubSignup = async (req, res) => {
  try {
    const { name, email, avatar, githubId, password } = req.body;

    // Pehle user dhoondo by email or githubId
    let user = await User.findOne({ $or: [{ email }, { githubId }] });

    if (!user) {
      // ✅ Agar user nahi hai to create karo
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      user = new User({
        name,
        email,
        password: hashedPassword,
        githubId,
        avatar,
      });

      await user.save();
    } else if (!user.password && password) {
      // ✅ Agar user pehle se hai lekin password blank hai, to update karo
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    // JWT token banao
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("GitHub Signup Error:", err);
    res.status(500).json({ error: "GitHub signup failed" });
  }
};


