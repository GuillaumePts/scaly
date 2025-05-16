const express = require("express");
const passport = require("passport");
const User = require("../models/Users");

const router = express.Router();

// Google Auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    session: false
}), async (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
});

module.exports = router;
