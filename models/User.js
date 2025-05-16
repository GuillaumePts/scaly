const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String, // hashé avec bcrypt
  siteId: String
});

module.exports = mongoose.model('User', UserSchema);