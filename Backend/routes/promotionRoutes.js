import express from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import Promotion from '../models/Promotion.js';

const router = express.Router();

// PUBLIC - Get active promotions
router.get('/active', async (req, res) => {
  try {
    const { placement } = req.query;
    const now = new Date();

    const query = {
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    };

    if (placement) query.placement = placement;

    const promotions = await Promotion.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(5);

    res.json({ promotions });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track view
router.post('/:id/view', async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 }
    });
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Track click
router.post('/:id/click', async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, {
      $inc: { clickCount: 1 }
    });
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN - List all promotions
router.get('/admin/list', adminAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [promotions, total] = await Promise.all([
      Promotion.find()
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Promotion.countDocuments()
    ]);

    res.json({ promotions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('List promotions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN - Create promotion
router.post('/admin/create', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json({ message: 'Promotion created successfully', promotion });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN - Update promotion
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.json({ message: 'Promotion updated', promotion });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN - Delete promotion
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN - Toggle active status
router.patch('/admin/:id/toggle', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    res.json({ 
      message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'}`, 
      promotion 
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
