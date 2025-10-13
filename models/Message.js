import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  chatId: {
    type: String,
    required: true,
    index: true
  },
  messageId: {
    type: String,
    required: true,
    index: true
  },
  fromMe: Boolean,
  participant: String,
  messageType: String,
  content: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Number,
    index: true
  },
  status: String,
  key: mongoose.Schema.Types.Mixed,
  message: mongoose.Schema.Types.Mixed,
  pushName: String
}, {
  timestamps: true
});

messageSchema.index({ phone: 1, chatId: 1, messageId: 1 }, { unique: true });
messageSchema.index({ phone: 1, chatId: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);
