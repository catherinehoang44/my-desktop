const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Image = require('../models/Image');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const images = await Image.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.json([]); // Return empty array instead of error
  }
});

// Upload an image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const image = new Image({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `uploads/${req.file.filename}`,
      size: req.file.size
    });

    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../client/public', image.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

