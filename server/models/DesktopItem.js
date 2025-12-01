const mongoose = require('mongoose');

const desktopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['recycle', 'paint', 'notepad', 'calculator', 'folder', 'images']
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DesktopItem', desktopItemSchema);


