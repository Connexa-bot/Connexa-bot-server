import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  jid: {
    type: String,
    required: true,
    index: true
  },
  name: String,
  notify: String,
  verifiedName: String,
  imgUrl: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

contactSchema.index({ phone: 1, jid: 1 }, { unique: true });

export default mongoose.model('Contact', contactSchema);
