const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  
}, {timestamps: true});

const userFromDb = mongoose.model('username', UserSchema);
module.exports = userFromDb;

