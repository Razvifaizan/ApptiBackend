const express = require("express");
const { googleCheck , googleSignup } = require("../controller/authController");
const router = express.Router();

// router.post("/google", googleAuth);
router.post("/check", googleCheck);
router.post("/signup", googleSignup);

module.exports = router;
