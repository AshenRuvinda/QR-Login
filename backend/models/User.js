const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  profilePic: { type: String },
  isSuspended: { type: Boolean, default: false },
  currentStatus: { 
    type: String, 
    enum: ['OUT', 'IN'], 
    default: 'OUT' 
  },
  attendance: [
    {
      timestamp: { type: Date, default: Date.now },
      status: { type: String, enum: ['IN', 'OUT'], required: true },
      markedBy: { type: String, required: true }, // Username or userId of operator
    },
  ],
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);