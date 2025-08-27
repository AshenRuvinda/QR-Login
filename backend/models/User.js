const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, required: true, enum: ['operator', 'hr', 'employee'] },
  profilePic: { type: String },
  password: { type: String }, // Required for operator/hr
  isSuspended: { type: Boolean, default: false },
  attendance: [
    {
      timestamp: { type: Date, default: Date.now },
      markedBy: { type: String },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);