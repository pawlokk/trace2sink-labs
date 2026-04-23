const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: {
      bio: { type: String, default: '' },
      team: { type: String, default: '' },
      importTag: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
