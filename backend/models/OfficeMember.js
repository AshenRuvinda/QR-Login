const mongoose = require('mongoose');

const officeMemberSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

module.exports = mongoose.model('OfficeMember', officeMemberSchema);