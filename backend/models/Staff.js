const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  staffId: { type: Number, unique: true }, // Different from userId for regular users
  username: { type: String, unique: true }, // For admin login
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'hr', 'operator'] 
  },
  password: { type: String, required: true },
  profilePic: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);