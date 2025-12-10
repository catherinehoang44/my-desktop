const express = require('express');
const router = express.Router();
const DesktopItem = require('../models/DesktopItem');

// GET all desktop items
router.get('/items', async (req, res) => {
  try {
    const items = await DesktopItem.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching desktop items:', error);
    res.json([]); // Return empty array on error
  }
});

// POST create new desktop item
router.post('/items', async (req, res) => {
  try {
    const { name, type, position } = req.body;
    const newItem = new DesktopItem({
      name,
      type,
      position: position || { x: 0, y: 0 }
    });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    console.error('Error creating desktop item:', error);
    res.status(500).json({ error: 'Failed to create desktop item' });
  }
});

// PUT update desktop item
router.put('/items/:id', async (req, res) => {
  try {
    const { position } = req.body;
    const updatedItem = await DesktopItem.findByIdAndUpdate(
      req.params.id,
      { position },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ error: 'Desktop item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating desktop item:', error);
    res.status(500).json({ error: 'Failed to update desktop item' });
  }
});

// DELETE desktop item
router.delete('/items/:id', async (req, res) => {
  try {
    const deletedItem = await DesktopItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Desktop item not found' });
    }
    res.json({ message: 'Desktop item deleted successfully' });
  } catch (error) {
    console.error('Error deleting desktop item:', error);
    res.status(500).json({ error: 'Failed to delete desktop item' });
  }
});

module.exports = router;




