const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    subscriptionDate: {
        type: Date,
        default: Date.now,
    },
    subscriptionEndDate: {
        type: Date,
    },
    stripeCustomerId: {
        type: String,
        required: true,
    },
    siteId: {
        type: String,
        required: true,
        unique: true,
        minlength: 15,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "client", // ou "admin" selon ton usage
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profilePicture: String,
    phoneNumber: String,
});

module.exports = mongoose.model("User", UserSchema);