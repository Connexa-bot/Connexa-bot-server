import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
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
  name: String,
  profilePicUrl: String,
  unreadCount: {
    type: Number,
    default: 0
  },
  lastMessageTimestamp: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  muteExpiry: Number,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

chatSchema.index({ phone: 1, chatId: 1 }, { unique: true });

export default mongoose.model('Chat', chatSchema);
