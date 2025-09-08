import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { githubCheck, githubSignup } from "../controller/githubAuthController.js";

const router = express.Router();

// ✅ Step 1: Check if GitHub user exists
router.post("/check", githubCheck);

// ✅ Step 2: Redirect to GitHub OAuth login
router.get("/oauth", (req, res) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  if (!CLIENT_ID) {
    return res.status(500).send("GitHub Client ID not configured");
  }

  const redirect_uri = "https://apptibackend.onrender.com/api/auth/github/callback"; // must match GitHub App settings
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user:email&redirect_uri=${redirect_uri}`;
  
  res.redirect(githubAuthUrl);
});

// ✅ Step 3: GitHub callback (exchange code → access_token → user info → JWT)
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code not provided");

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  try {
    // 🔑 Exchange code for access token
    const tokenRes = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const access_token = tokenRes.data.access_token;

    if (!access_token) {
      return res.status(400).send("Failed to get access token from GitHub");
    }

    // 👤 Fetch user info
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    // 📧 Fetch email separately if null
    let email = userRes.data.email;
    if (!email) {
      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Find primary verified email
      const primaryEmail = emailRes.data.find((e) => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : `${userRes.data.login}@github.com`;
    }

    const { id, login, avatar_url } = userRes.data;

    // 🔍 Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Naya user (password baad me set karega)
      user = new User({
        name: login,
        email,
        password: "", // empty since GitHub handles login
        githubId: id,
        avatar: avatar_url,
      });
      await user.save();

      // 🔑 Temporary JWT (short expiry)
      const tempToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name, githubId: id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // 👉 Redirect to frontend signup with newUser=true
      return res.redirect(
        `http://localhost:5173/signup?token=${tempToken}&newUser=true`
      );
    }

    // ✅ Existing user → normal login
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 👉 Redirect to dashboard with newUser=false
    res.redirect(`http://localhost:5173/dashboard?token=${token}&newUser=false`);
  } catch (err) {
    console.error("GitHub OAuth failed:", err.response?.data || err.message);
    res.status(500).send("GitHub OAuth failed");
  }
});


// ✅ Step 4: Optional manual signup route
router.post("/signup", githubSignup);

export default router;
