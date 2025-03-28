const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String }, // Pour l'auth Google
    isVerified: { type: Boolean, default: false }, // Email vérifié ou non
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);