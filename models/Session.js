import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  connected: {
    type: Boolean,
    default: false
  },
  qrCode: String,
  linkCode: String,
  lastConnected: Date,
  userData: mongoose.Schema.Types.Mixed,
  storeData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);
