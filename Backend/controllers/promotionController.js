import Promotion from '../models/Promotion.js';

export const getActivePromotions = async (req, res) => {
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
      .sort({ priority: -1 })
      .limit(5);

    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const trackView = async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const trackClick = async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, { $inc: { clickCount: 1 } });
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
